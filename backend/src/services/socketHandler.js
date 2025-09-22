import ChatService from '../services/chatService.js';
import AuthService from '../services/authService.js';

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('用户连接:', socket.id);

      // 用户认证
      socket.on('authenticate', async (token) => {
        try {
          const decoded = AuthService.verifyAccessToken(token);
          const userId = decoded.userId;
          
          // 存储用户连接信息
          this.connectedUsers.set(userId, socket.id);
          this.userSockets.set(socket.id, userId);
          
          // 加入用户专属房间
          socket.join(userId);
          
          // 通知用户连接成功
          socket.emit('authenticated', { userId });
          
          // 通知其他用户该用户上线
          socket.broadcast.emit('user_online', { userId });
          
          console.log(`用户 ${userId} 认证成功`);
        } catch (error) {
          socket.emit('authentication_error', { message: '认证失败' });
        }
      });

      // 加入会话
      socket.on('join_conversation', async (data) => {
        try {
          const { conversationId } = data;
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            socket.emit('error', { message: '请先认证' });
            return;
          }

          // 验证用户是否有权限加入该会话
          await ChatService.getConversationById(conversationId, userId);
          
          // 加入会话房间
          socket.join(conversationId);
          
          socket.emit('joined_conversation', { conversationId });
          console.log(`用户 ${userId} 加入会话 ${conversationId}`);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 离开会话
      socket.on('leave_conversation', (data) => {
        const { conversationId } = data;
        socket.leave(conversationId);
        socket.emit('left_conversation', { conversationId });
      });

      // 发送消息
      socket.on('send_message', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            socket.emit('error', { message: '请先认证' });
            return;
          }

          const { conversationId, messageType, content, fileId, replyTo } = data;
          
          // 使用ChatService发送消息
          const message = await ChatService.sendMessage(conversationId, userId, {
            messageType,
            content,
            fileId,
            replyTo
          });

          // 向会话中的所有用户广播消息
          this.io.to(conversationId).emit('new_message', {
            message,
            conversationId
          });

          // 向参与者发送通知（除了发送者）
          const conversation = await ChatService.getConversationById(conversationId, userId);
          const otherParticipants = conversation.participants.filter(
            p => p._id.toString() !== userId
          );

          otherParticipants.forEach(participant => {
            const participantSocketId = this.connectedUsers.get(participant._id.toString());
            if (participantSocketId) {
              this.io.to(participant._id.toString()).emit('message_notification', {
                conversationId,
                message,
                sender: message.senderId
              });
            }
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 输入状态
      socket.on('typing', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            return;
          }

          const { conversationId, isTyping } = data;
          
          // 验证用户权限
          await ChatService.getConversationById(conversationId, userId);
          
          // 向会话中的其他用户广播输入状态
          socket.to(conversationId).emit('user_typing', {
            userId,
            conversationId,
            isTyping
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 标记消息为已读
      socket.on('mark_as_read', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            socket.emit('error', { message: '请先认证' });
            return;
          }

          const { conversationId, messageIds } = data;
          
          await ChatService.markMessagesAsRead(conversationId, userId, messageIds);
          
          // 通知会话中的其他用户消息已被读取
          socket.to(conversationId).emit('messages_read', {
            userId,
            conversationId,
            messageIds
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 消息反应
      socket.on('add_reaction', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            socket.emit('error', { message: '请先认证' });
            return;
          }

          const { messageId, emoji } = data;
          
          await ChatService.addMessageReaction(messageId, userId, emoji);
          
          // 获取消息所属的会话
          const message = await Message.findById(messageId);
          if (message) {
            // 向会话中的所有用户广播反应
            this.io.to(message.conversationId.toString()).emit('reaction_added', {
              messageId,
              userId,
              emoji
            });
          }

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 移除消息反应
      socket.on('remove_reaction', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            socket.emit('error', { message: '请先认证' });
            return;
          }

          const { messageId } = data;
          
          await ChatService.removeMessageReaction(messageId, userId);
          
          // 获取消息所属的会话
          const message = await Message.findById(messageId);
          if (message) {
            // 向会话中的所有用户广播反应移除
            this.io.to(message.conversationId.toString()).emit('reaction_removed', {
              messageId,
              userId
            });
          }

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 用户断开连接
      socket.on('disconnect', () => {
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          // 清理连接映射
          this.connectedUsers.delete(userId);
          this.userSockets.delete(socket.id);
          
          // 通知其他用户该用户下线
          socket.broadcast.emit('user_offline', { userId });
          
          console.log(`用户 ${userId} 断开连接`);
        } else {
          console.log('未认证用户断开连接:', socket.id);
        }
      });

      // 错误处理
      socket.on('error', (error) => {
        console.error('Socket错误:', error);
      });
    });
  }

  // 获取在线用户列表
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // 检查用户是否在线
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // 向特定用户发送消息
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // 向会话中的所有用户发送消息
  sendToConversation(conversationId, event, data, excludeUserId = null) {
    const room = this.io.sockets.adapter.rooms.get(conversationId);
    if (room) {
      if (excludeUserId) {
        const excludeSocketId = this.connectedUsers.get(excludeUserId);
        room.forEach(socketId => {
          if (socketId !== excludeSocketId) {
            this.io.to(socketId).emit(event, data);
          }
        });
      } else {
        this.io.to(conversationId).emit(event, data);
      }
    }
  }

  // 广播给所有在线用户
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

export default SocketHandler;
import { Conversation, Message, User } from '../models/index.js';
import mongoose from 'mongoose';

class ChatService {
  // 创建会话
  async createConversation(creatorId, participantIds, conversationType = 'private', title = '') {
    // 确保参与者包含创建者
    const allParticipants = [...new Set([creatorId, ...participantIds])];
    
    // 验证参与者数量
    if (conversationType === 'private' && allParticipants.length !== 2) {
      throw new Error('私人会话必须有且仅有2个参与者');
    }
    
    if (conversationType === 'group' && allParticipants.length < 3) {
      throw new Error('群组会话至少需要3个参与者');
    }
    
    // 检查私人会话是否已存在
    if (conversationType === 'private') {
      const existingConversation = await Conversation.findOne({
        conversationType: 'private',
        participants: { $all: allParticipants, $size: 2 }
      });
      
      if (existingConversation) {
        return existingConversation;
      }
    }
    
    // 验证所有参与者都存在
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      throw new Error('部分参与者不存在');
    }
    
    const conversation = new Conversation({
      participants: allParticipants,
      conversationType,
      title: conversationType === 'group' ? title : '',
      createdBy: creatorId,
      admins: conversationType === 'group' ? [creatorId] : []
    });
    
    await conversation.save();
    await conversation.populate('participants', 'username avatar');
    
    return conversation;
  }
  
  // 获取用户的会话列表
  async getUserConversations(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'username avatar coverImage isVerified')
    .populate('lastMessage')
    .sort({ lastActivity: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true
    });
    
    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // 获取会话详情
  async getConversationById(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'username avatar bio coverImage isVerified')
      .populate('admins', 'username avatar');
    
    if (!conversation || !conversation.isActive) {
      throw new Error('会话不存在');
    }
    
    // 检查用户是否是会话参与者
    if (!conversation.participants.some(p => p._id.toString() === userId)) {
      throw new Error('无权访问此会话');
    }
    
    return conversation;
  }
  
  // 发送消息
  async sendMessage(conversationId, senderId, messageData) {
    const { messageType, content, fileId, replyTo } = messageData;
    
    // 验证会话存在且用户有权限
    const conversation = await this.getConversationById(conversationId, senderId);
    
    // 创建消息
    const message = new Message({
      conversationId,
      senderId,
      messageType: messageType || 'text',
      content,
      fileId,
      replyTo
    });
    
    // 如果是文件消息，填充文件信息
    if (fileId) {
      await message.populate('fileId', 'filename originalName fileUrl thumbnailUrl fileSize mimeType metadata');
      message.fileUrl = message.fileId.fileUrl;
      message.fileName = message.fileId.originalName;
      message.fileSize = message.fileId.fileSize;
      message.thumbnailUrl = message.fileId.thumbnailUrl;
      message.metadata = message.fileId.metadata;
    }
    
    await message.save();
    
    // 更新会话的最后消息和活动时间
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = message.createdAt;
    conversation.lastActivity = new Date();
    await conversation.save();
    
    // 填充发送者信息
    await message.populate('senderId', 'username avatar');
    
    return message;
  }
  
  // 获取会话消息
  async getConversationMessages(conversationId, userId, options = {}) {
    const { page = 1, limit = 50, before } = options;
    const skip = (page - 1) * limit;
    
    // 验证用户权限
    await this.getConversationById(conversationId, userId);
    
    // 构建查询条件
    const query = {
      conversationId,
      isDeleted: false
    };
    
    // 如果指定了before参数，获取该时间之前的消息
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    const messages = await Message.find(query)
      .populate('senderId', 'username avatar')
      .populate('replyTo', 'content senderId messageType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments(query);
    
    return {
      messages: messages.reverse(), // 按时间正序返回
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // 标记消息为已读
  async markMessagesAsRead(conversationId, userId, messageIds) {
    // 验证用户权限
    await this.getConversationById(conversationId, userId);
    
    const messages = await Message.find({
      _id: { $in: messageIds },
      conversationId,
      senderId: { $ne: userId } // 不标记自己发送的消息
    });
    
    const updates = [];
    for (const message of messages) {
      if (!message.readBy.some(read => read.user.toString() === userId)) {
        updates.push(message.markAsRead(userId));
      }
    }
    
    await Promise.all(updates);
    
    return { message: '消息已标记为已读' };
  }
  
  // 删除消息
  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);
    
    if (!message || message.isDeleted) {
      throw new Error('消息不存在');
    }
    
    // 验证用户权限（只能删除自己的消息）
    if (message.senderId.toString() !== userId) {
      throw new Error('无权删除此消息');
    }
    
    await message.softDelete(userId);
    
    return { message: '消息删除成功' };
  }
  
  // 编辑消息
  async editMessage(messageId, userId, newContent) {
    const message = await Message.findById(messageId);
    
    if (!message || message.isDeleted) {
      throw new Error('消息不存在');
    }
    
    // 验证用户权限
    if (message.senderId.toString() !== userId) {
      throw new Error('无权编辑此消息');
    }
    
    // 只能编辑文本消息
    if (message.messageType !== 'text') {
      throw new Error('只能编辑文本消息');
    }
    
    await message.editContent(newContent);
    
    return message;
  }
  
  // 添加消息反应
  async addMessageReaction(messageId, userId, emoji) {
    const message = await Message.findById(messageId);
    
    if (!message || message.isDeleted) {
      throw new Error('消息不存在');
    }
    
    // 验证用户是否在会话中
    await this.getConversationById(message.conversationId, userId);
    
    await message.addReaction(userId, emoji);
    
    return { message: '反应添加成功' };
  }
  
  // 移除消息反应
  async removeMessageReaction(messageId, userId) {
    const message = await Message.findById(messageId);
    
    if (!message || message.isDeleted) {
      throw new Error('消息不存在');
    }
    
    // 验证用户是否在会话中
    await this.getConversationById(message.conversationId, userId);
    
    await message.removeReaction(userId);
    
    return { message: '反应移除成功' };
  }
  
  // 添加会话参与者（仅群组会话）
  async addParticipant(conversationId, adminId, userIds) {
    const conversation = await this.getConversationById(conversationId, adminId);
    
    if (conversation.conversationType !== 'group') {
      throw new Error('只能向群组会话添加参与者');
    }
    
    // 检查管理员权限
    if (!conversation.admins.some(admin => admin._id.toString() === adminId)) {
      throw new Error('只有管理员可以添加参与者');
    }
    
    // 验证新参与者存在
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      throw new Error('部分用户不存在');
    }
    
    // 添加参与者
    for (const userId of userIds) {
      if (!conversation.participants.includes(userId)) {
        await conversation.addParticipant(userId);
      }
    }
    
    // 发送系统消息
    await this.sendMessage(conversationId, adminId, {
      messageType: 'system',
      content: `${users.map(u => u.username).join(', ')} 加入了群组`,
      isSystemMessage: true
    });
    
    return conversation;
  }
  
  // 移除会话参与者
  async removeParticipant(conversationId, adminId, userId) {
    const conversation = await this.getConversationById(conversationId, adminId);
    
    if (conversation.conversationType !== 'group') {
      throw new Error('只能从群组会话移除参与者');
    }
    
    // 检查管理员权限
    if (!conversation.admins.some(admin => admin._id.toString() === adminId)) {
      throw new Error('只有管理员可以移除参与者');
    }
    
    // 不能移除自己
    if (adminId === userId) {
      throw new Error('不能移除自己');
    }
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    await conversation.removeParticipant(userId);
    
    // 发送系统消息
    await this.sendMessage(conversationId, adminId, {
      messageType: 'system',
      content: `${user.username} 被移出了群组`,
      isSystemMessage: true
    });
    
    return conversation;
  }
  
  // 离开会话
  async leaveConversation(conversationId, userId) {
    const conversation = await this.getConversationById(conversationId, userId);
    
    if (conversation.conversationType === 'private') {
      throw new Error('不能离开私人会话');
    }
    
    const user = await User.findById(userId);
    await conversation.removeParticipant(userId);
    
    // 发送系统消息
    await this.sendMessage(conversationId, userId, {
      messageType: 'system',
      content: `${user.username} 离开了群组`,
      isSystemMessage: true
    });
    
    return { message: '已离开会话' };
  }
  
  // 获取未读消息数量
  async getUnreadCount(userId) {
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    });
    
    let totalUnread = 0;
    
    for (const conversation of conversations) {
      const unreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        'readBy.user': { $ne: userId },
        isDeleted: false
      });
      
      totalUnread += unreadCount;
    }
    
    return { unreadCount: totalUnread };
  }
  
  // 搜索消息
  async searchMessages(userId, searchTerm, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('搜索关键词至少需要2个字符');
    }
    
    // 获取用户参与的会话
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    }).select('_id');
    
    const conversationIds = conversations.map(c => c._id);
    
    const messages = await Message.find({
      conversationId: { $in: conversationIds },
      content: { $regex: searchTerm.trim(), $options: 'i' },
      messageType: 'text',
      isDeleted: false
    })
    .populate('senderId', 'username avatar')
    .populate('conversationId', 'participants conversationType title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      content: { $regex: searchTerm.trim(), $options: 'i' },
      messageType: 'text',
      isDeleted: false
    });
    
    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default new ChatService();



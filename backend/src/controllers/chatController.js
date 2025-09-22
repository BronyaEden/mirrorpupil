import ChatService from '../services/chatService.js';
import { validationResult } from 'express-validator';

class ChatController {
  // 创建会话
  async createConversation(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const { participantIds, conversationType, title } = req.body;
      
      const conversation = await ChatService.createConversation(
        req.user.userId,
        participantIds,
        conversationType,
        title
      );

      res.status(201).json({
        success: true,
        message: '会话创建成功',
        data: { conversation }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取用户会话列表
  async getUserConversations(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await ChatService.getUserConversations(req.user.userId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取会话详情
  async getConversationById(req, res) {
    try {
      const { conversationId } = req.params;
      const conversation = await ChatService.getConversationById(conversationId, req.user.userId);

      res.json({
        success: true,
        data: { conversation }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权访问') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 发送消息
  async sendMessage(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const { conversationId } = req.params;
      const message = await ChatService.sendMessage(
        conversationId,
        req.user.userId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: '消息发送成功',
        data: { message }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权访问') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取会话消息
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        before: req.query.before
      };

      const result = await ChatService.getConversationMessages(
        conversationId,
        req.user.userId,
        options
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('无权访问') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 标记消息为已读
  async markMessagesAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const { messageIds } = req.body;

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供要标记的消息ID列表'
        });
      }

      const result = await ChatService.markMessagesAsRead(
        conversationId,
        req.user.userId,
        messageIds
      );

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('无权访问') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 删除消息
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const result = await ChatService.deleteMessage(messageId, req.user.userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('无权删除') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 编辑消息
  async editMessage(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const { messageId } = req.params;
      const { content } = req.body;

      const message = await ChatService.editMessage(messageId, req.user.userId, content);

      res.json({
        success: true,
        message: '消息编辑成功',
        data: { message }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权编辑') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 添加消息反应
  async addMessageReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;

      if (!emoji) {
        return res.status(400).json({
          success: false,
          message: '请提供表情符号'
        });
      }

      const result = await ChatService.addMessageReaction(messageId, req.user.userId, emoji);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('无权') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 移除消息反应
  async removeMessageReaction(req, res) {
    try {
      const { messageId } = req.params;
      const result = await ChatService.removeMessageReaction(messageId, req.user.userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('无权') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 添加会话参与者
  async addParticipant(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const { conversationId } = req.params;
      const { userIds } = req.body;

      const conversation = await ChatService.addParticipant(
        conversationId,
        req.user.userId,
        userIds
      );

      res.json({
        success: true,
        message: '参与者添加成功',
        data: { conversation }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权') || error.message.includes('只有管理员') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 移除会话参与者
  async removeParticipant(req, res) {
    try {
      const { conversationId, userId } = req.params;

      const conversation = await ChatService.removeParticipant(
        conversationId,
        req.user.userId,
        userId
      );

      res.json({
        success: true,
        message: '参与者移除成功',
        data: { conversation }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权') || error.message.includes('只有管理员') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 离开会话
  async leaveConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const result = await ChatService.leaveConversation(conversationId, req.user.userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('无权访问') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取未读消息数量
  async getUnreadCount(req, res) {
    try {
      const result = await ChatService.getUnreadCount(req.user.userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 搜索消息
  async searchMessages(req, res) {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词至少需要2个字符'
        });
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await ChatService.searchMessages(
        req.user.userId,
        searchTerm,
        options
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ChatController();
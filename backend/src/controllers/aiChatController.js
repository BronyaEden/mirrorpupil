import { validationResult } from 'express-validator';
import AIChatService from '../services/aiChatService.js';

class AIChatController {
  // 与AI对话
  async chatWithAI(req, res) {
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

      const { message } = req.body;
      
      // 调用AI服务获取回复
      const reply = await AIChatService.getAIResponse(message, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'AI回复成功',
        data: { reply }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取AI聊天历史
  async getAIChatHistory(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await AIChatService.getChatHistory(req.user.userId, options);

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
  
  // 保存AI聊天消息
  async saveAIChatMessage(req, res) {
    try {
      const { content, isAI, timestamp } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          message: '消息内容不能为空'
        });
      }
      
      const message = await AIChatService.saveChatMessage(
        content, 
        isAI, 
        req.user.userId, 
        timestamp
      );

      res.status(201).json({
        success: true,
        message: '消息保存成功',
        data: { message }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AIChatController();
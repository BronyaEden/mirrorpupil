import { Message } from '../models/index.js';

class AIChatService {
  // 模拟AI回复，实际项目中应该调用真实的AI服务API
  async getAIResponse(userMessage, userId) {
    // 这里应该调用真实的AI服务，比如OpenAI、讯飞等
    // 为了演示，我们使用模拟回复
    
    // 保存用户消息到数据库
    const userMsg = new Message({
      conversationId: null, // AI聊天没有传统意义上的会话ID
      senderId: userId,
      messageType: 'text',
      content: userMessage,
      isSystemMessage: false
    });
    
    await userMsg.save();
    
    // 模拟AI回复
    let aiReply = '';
    
    if (userMessage.includes('你好') || userMessage.includes('Hello')) {
      aiReply = '你好！我是AI助手，有什么可以帮助你的吗？';
    } else if (userMessage.includes('文件') || userMessage.includes('上传')) {
      aiReply = '关于文件上传，你可以在文件上传页面选择文件并点击上传按钮。支持多种格式的文件。';
    } else if (userMessage.includes('聊天') || userMessage.includes('消息')) {
      aiReply = '你可以通过消息功能与其他用户进行聊天。在用户个人主页可以发起聊天。';
    } else {
      // 默认回复
      const replies = [
        '这是一个很好的问题！让我来帮你解答。',
        '我理解你的需求，我会尽力帮助你。',
        '关于这个问题，我可以提供以下建议...',
        '感谢你的提问，这是我的看法...',
        '让我思考一下，我认为...'
      ];
      aiReply = replies[Math.floor(Math.random() * replies.length)];
    }
    
    // 保存AI回复到数据库
    const aiMsg = new Message({
      conversationId: null, // AI聊天没有传统意义上的会话ID
      senderId: 'AI_SYSTEM', // 使用特殊ID标识AI消息
      messageType: 'text',
      content: aiReply,
      isSystemMessage: true
    });
    
    await aiMsg.save();
    
    return {
      content: aiReply,
      messageId: aiMsg._id,
      timestamp: aiMsg.createdAt
    };
  }
  
  // 获取AI聊天历史
  async getChatHistory(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    // 查找与AI的聊天记录（conversationId为null且是系统消息的记录）
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { senderId: 'AI_SYSTEM' }
      ],
      conversationId: null,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Message.countDocuments({
      $or: [
        { senderId: userId },
        { senderId: 'AI_SYSTEM' }
      ],
      conversationId: null,
      isDeleted: false
    });
    
    return {
      items: messages.reverse(), // 按时间正序返回
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // 保存AI聊天消息
  async saveChatMessage(content, isAI, userId, timestamp) {
    const message = new Message({
      conversationId: null,
      senderId: isAI ? 'AI_SYSTEM' : userId,
      messageType: 'text',
      content: content,
      isSystemMessage: isAI,
      createdAt: timestamp ? new Date(timestamp) : new Date()
    });
    
    await message.save();
    return message;
  }
}

export default new AIChatService();

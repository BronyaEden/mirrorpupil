import express from 'express';
import { body, param, query } from 'express-validator';
import ChatController from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 验证规则
const createConversationValidation = [
  body('participantIds')
    .isArray({ min: 1 })
    .withMessage('参与者列表不能为空'),
  body('participantIds.*')
    .isMongoId()
    .withMessage('参与者ID格式不正确'),
  body('conversationType')
    .isIn(['private', 'group'])
    .withMessage('无效的会话类型'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('会话标题不能超过100个字符')
];

const sendMessageValidation = [
  param('conversationId').isMongoId().withMessage('无效的会话ID'),
  body('messageType')
    .optional()
    .isIn(['text', 'file', 'image', 'video', 'audio'])
    .withMessage('无效的消息类型'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('消息内容长度必须在1-2000个字符之间'),
  body('fileId')
    .optional()
    .isMongoId()
    .withMessage('无效的文件ID'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('无效的回复消息ID')
];

const editMessageValidation = [
  param('messageId').isMongoId().withMessage('无效的消息ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('消息内容长度必须在1-2000个字符之间')
];

const conversationIdValidation = [
  param('conversationId').isMongoId().withMessage('无效的会话ID')
];

const messageIdValidation = [
  param('messageId').isMongoId().withMessage('无效的消息ID')
];

const addParticipantValidation = [
  param('conversationId').isMongoId().withMessage('无效的会话ID'),
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('用户列表不能为空'),
  body('userIds.*')
    .isMongoId()
    .withMessage('用户ID格式不正确')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间')
];

// 创建会话
router.post('/conversations',
  authenticateToken,
  createConversationValidation,
  ChatController.createConversation
);

// 获取用户会话列表
router.get('/conversations',
  authenticateToken,
  paginationValidation,
  ChatController.getUserConversations
);

// 获取会话详情
router.get('/conversations/:conversationId',
  authenticateToken,
  conversationIdValidation,
  ChatController.getConversationById
);

// 获取会话消息
router.get('/conversations/:conversationId/messages',
  authenticateToken,
  conversationIdValidation,
  paginationValidation,
  query('before')
    .optional()
    .isISO8601()
    .withMessage('时间格式不正确'),
  ChatController.getConversationMessages
);

// 发送消息
router.post('/conversations/:conversationId/messages',
  authenticateToken,
  sendMessageValidation,
  ChatController.sendMessage
);

// 标记消息为已读
router.put('/conversations/:conversationId/read',
  authenticateToken,
  conversationIdValidation,
  body('messageIds')
    .isArray({ min: 1 })
    .withMessage('消息ID列表不能为空'),
  body('messageIds.*')
    .isMongoId()
    .withMessage('消息ID格式不正确'),
  ChatController.markMessagesAsRead
);

// 添加会话参与者
router.post('/conversations/:conversationId/participants',
  authenticateToken,
  addParticipantValidation,
  ChatController.addParticipant
);

// 移除会话参与者
router.delete('/conversations/:conversationId/participants/:userId',
  authenticateToken,
  param('conversationId').isMongoId().withMessage('无效的会话ID'),
  param('userId').isMongoId().withMessage('无效的用户ID'),
  ChatController.removeParticipant
);

// 离开会话
router.post('/conversations/:conversationId/leave',
  authenticateToken,
  conversationIdValidation,
  ChatController.leaveConversation
);

// 编辑消息
router.put('/messages/:messageId',
  authenticateToken,
  editMessageValidation,
  ChatController.editMessage
);

// 删除消息
router.delete('/messages/:messageId',
  authenticateToken,
  messageIdValidation,
  ChatController.deleteMessage
);

// 添加消息反应
router.post('/messages/:messageId/reactions',
  authenticateToken,
  messageIdValidation,
  body('emoji')
    .notEmpty()
    .withMessage('表情符号不能为空')
    .isIn(['👍', '❤️', '😄', '😮', '😢', '😡'])
    .withMessage('不支持的表情符号'),
  ChatController.addMessageReaction
);

// 移除消息反应
router.delete('/messages/:messageId/reactions',
  authenticateToken,
  messageIdValidation,
  ChatController.removeMessageReaction
);

// 获取未读消息数量
router.get('/unread-count',
  authenticateToken,
  ChatController.getUnreadCount
);

// 搜索消息
router.get('/search/messages',
  authenticateToken,
  query('q')
    .notEmpty()
    .trim()
    .isLength({ min: 2 })
    .withMessage('搜索关键词至少需要2个字符'),
  paginationValidation,
  ChatController.searchMessages
);

export default router;
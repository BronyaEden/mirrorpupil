import express from 'express';
import { body, param, query } from 'express-validator';
import AdminController from '../controllers/adminController.js';
import { authenticateAdmin, requireAdmin, logAdminAction } from '../middleware/adminAuth.js';

const router = express.Router();

// 管理员登录验证规则
const adminLoginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('用户名不能为空'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// 用户管理验证规则
const updateUserValidation = [
  param('userId').isMongoId().withMessage('无效的用户ID'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('无效的用户角色'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive必须是布尔值')
];

// 创建用户验证规则
const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('无效的用户角色')
];

// 分页验证规则
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

// 文件ID验证规则
const fileIdValidation = [
  param('fileId').isMongoId().withMessage('无效的文件ID')
];

// 用户ID验证规则
const userIdValidation = [
  param('userId').isMongoId().withMessage('无效的用户ID')
];

// ==================== 认证相关路由 ====================

// 管理员登录
router.post('/login', adminLoginValidation, AdminController.login);

// 初始化管理员账户（仅在开发环境）
router.post('/init-admin', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: '生产环境不允许此操作'
      });
    }

    const { User } = await import('../models/index.js');
    
    // 检查是否已有管理员
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: '管理员账户已存在',
        data: { username: existingAdmin.username }
      });
    }

    // 查找用户名为admin的用户
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      // 将其设置为管理员
      adminUser.role = 'admin';
      await adminUser.save();
      
      res.json({
        success: true,
        message: '管理员权限设置成功',
        data: { username: adminUser.username, role: adminUser.role }
      });
    } else {
      res.status(404).json({
        success: false,
        message: '未找到用户名为admin的账户，请先注册'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== 仪表板相关路由 ====================

// 获取仪表板统计数据
router.get('/dashboard/stats', 
  authenticateAdmin, 
  logAdminAction('view_dashboard_stats'),
  AdminController.getDashboardStats
);

// 获取数据分析
router.get('/analytics', 
  authenticateAdmin,
  query('period')
    .optional()
    .isIn(['24h', '7d', '30d'])
    .withMessage('无效的时间周期'),
  logAdminAction('view_analytics'),
  AdminController.getAnalytics
);

// ==================== 用户管理路由 ====================

// 获取用户列表
router.get('/users', 
  authenticateAdmin,
  paginationValidation,
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('搜索关键词不能为空'),
  query('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('无效的用户角色'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive必须是布尔值'),
  logAdminAction('view_users'),
  AdminController.getUsers
);

// 创建新用户
router.post('/users', 
  authenticateAdmin,
  requireAdmin,
  createUserValidation,
  logAdminAction('create_user'),
  AdminController.createUser
);

// 获取用户详细信息
router.get('/users/:userId', 
  authenticateAdmin,
  requireAdmin,
  userIdValidation,
  logAdminAction('view_user'),
  AdminController.getUserById
);

// 更新用户信息
router.put('/users/:userId', 
  authenticateAdmin,
  requireAdmin,
  updateUserValidation,
  logAdminAction('update_user'),
  AdminController.updateUser
);

// 切换用户状态（启用/禁用）
router.patch('/users/:userId/toggle-status', 
  authenticateAdmin,
  requireAdmin,
  userIdValidation,
  logAdminAction('toggle_user_status'),
  AdminController.toggleUserStatus
);

// 删除用户（仅超级管理员）
router.delete('/users/:userId', 
  authenticateAdmin,
  requireAdmin,
  userIdValidation,
  logAdminAction('delete_user'),
  AdminController.deleteUser
);

// ==================== 文件管理路由 ====================

// 获取文件列表
router.get('/files', 
  authenticateAdmin,
  requireAdmin,
  paginationValidation,
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('搜索关键词不能为空'),
  query('fileType')
    .optional()
    .isIn(['image', 'video', 'audio', 'document', 'other'])
    .withMessage('无效的文件类型'),
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic必须是布尔值'),
  logAdminAction('view_files'),
  AdminController.getFiles
);

// 删除文件
router.delete('/files/:fileId', 
  authenticateAdmin,
  requireAdmin,
  fileIdValidation,
  logAdminAction('delete_file'),
  AdminController.deleteFile
);

// 批量删除文件
router.delete('/files', 
  authenticateAdmin,
  requireAdmin,
  body('fileIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('请提供要删除的文件ID列表（最多100个）'),
  body('fileIds.*')
    .isMongoId()
    .withMessage('文件ID格式不正确'),
  logAdminAction('batch_delete_files'),
  AdminController.batchDeleteFiles
);

// 恢复已删除文件
router.patch('/files/:fileId/restore', 
  authenticateAdmin,
  requireAdmin,
  fileIdValidation,
  logAdminAction('restore_file'),
  AdminController.restoreFile
);

// ==================== 消息管理路由 ====================

// 获取消息列表
router.get('/messages', 
  authenticateAdmin,
  requireAdmin,
  paginationValidation,
  logAdminAction('view_messages'),
  async (req, res) => {
    try {
      // TODO: 实现消息管理逻辑
      res.json({
        success: true,
        message: '消息管理功能正在开发中'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ==================== 系统管理路由 ====================

// 获取系统日志
router.get('/system/logs', 
  authenticateAdmin,
  requireAdmin,
  paginationValidation,
  query('level')
    .optional()
    .isIn(['error', 'warn', 'info', 'debug'])
    .withMessage('无效的日志级别'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确'),
  logAdminAction('view_system_logs'),
  AdminController.getSystemLogs
);

// 获取系统状态
router.get('/system/status', 
  authenticateAdmin,
  requireAdmin,
  logAdminAction('view_system_status'),
  AdminController.getSystemStatus
);

// ==================== 设置管理路由 ====================

// 获取系统设置
router.get('/settings', 
  authenticateAdmin,
  requireAdmin,
  logAdminAction('view_settings'),
  async (req, res) => {
    try {
      // TODO: 从数据库或配置文件获取系统设置
      const settings = {
        general: {
          siteName: '镜瞳OVO',
          siteDescription: '集文件管理与社交互动于一体的现代化平台',
          allowRegistration: true,
          defaultUserRole: 'user'
        },
        upload: {
          maxFileSize: process.env.MAX_FILE_SIZE || '2147483648',
          allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [],
          uploadPath: process.env.UPLOAD_PATH || './uploads'
        },
        security: {
          jwtExpire: process.env.JWT_EXPIRE || '24h',
          bcryptRounds: process.env.BCRYPT_ROUNDS || '12',
          enableTwoFactor: false
        }
      };

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 更新系统设置
router.put('/settings', 
  authenticateAdmin,
  requireAdmin,
  logAdminAction('update_settings'),
  async (req, res) => {
    try {
      // TODO: 实现系统设置更新逻辑
      res.json({
        success: true,
        message: '系统设置更新功能正在开发中'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
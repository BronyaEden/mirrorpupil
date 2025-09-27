import express from 'express';
import { body, param, query } from 'express-validator';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadFile, handleUploadError } from '../middleware/upload.js';
import multer from 'multer';

// 头像上传配置
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

// 背景图上传配置
const coverUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const router = express.Router();

// 验证规则
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('用户名长度必须在1-30个字符之间')
    .matches(/^[\w\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含中文、字母、数字和下划线'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

const updateProfileValidation = [
  body('avatar')
    .optional()
    .isURL()
    .withMessage('头像必须是有效的URL'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('个人简介不能超过300个字符'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('所在地不能超过100个字符'),
  body('website')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('网站地址不能超过200个字符')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('当前密码不能为空'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码至少需要6个字符'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('确认密码与新密码不匹配');
      }
      return true;
    })
];

// 用户注册
router.post('/register', registerValidation, AuthController.register);

// 用户登录
router.post('/login', loginValidation, AuthController.login);

// 刷新令牌
router.post('/refresh', AuthController.refreshToken);

// 用户登出
router.post('/logout', AuthController.logout);

// 获取当前用户信息
router.get('/profile', authenticateToken, AuthController.getProfile);

// 更新用户信息
router.put('/profile', 
  authenticateToken, 
  updateProfileValidation, 
  AuthController.updateProfile
);

// 修改密码
router.put('/change-password', 
  authenticateToken, 
  changePasswordValidation, 
  AuthController.changePassword
);

// 关注用户
router.post('/follow/:userId', 
  authenticateToken, 
  param('userId').isMongoId().withMessage('无效的用户ID'),
  AuthController.followUser
);

// 取消关注
router.delete('/follow/:userId', 
  authenticateToken, 
  param('userId').isMongoId().withMessage('无效的用户ID'),
  AuthController.unfollowUser
);

// 搜索用户
router.get('/search-users', 
  query('q')
    .notEmpty()
    .trim()
    .isLength({ min: 1 })
    .withMessage('搜索关键词至少需要1个字符'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('每页数量必须在1-50之间'),
  AuthController.searchUsers
);

// 上传头像
router.post('/upload-avatar',
  authenticateToken,
  avatarUpload.single('avatar'),
  handleUploadError,
  AuthController.uploadAvatar
);

// 上传背景图
router.post('/upload-cover',
  authenticateToken,
  coverUpload.single('cover'),
  handleUploadError,
  AuthController.uploadCover
);

// 更新用户名
router.put('/update-username',
  authenticateToken,
  body('username')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('用户名长度必须在1-30个字符之间')
    .matches(/^[\w\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含中文、字母、数字和下划线'),
  AuthController.updateUsername
);

// 获取用户公开信息
router.get('/users/:userId', 
  param('userId').isMongoId().withMessage('无效的用户ID'),
  AuthController.getUserPublicProfile
);

// 获取用户的关注者列表
router.get('/users/:userId/followers', 
  param('userId').isMongoId().withMessage('无效的用户ID'),
  AuthController.getUserFollowers
);

// 获取用户的关注中列表
router.get('/users/:userId/following', 
  param('userId').isMongoId().withMessage('无效的用户ID'),
  AuthController.getUserFollowing
);

export default router;
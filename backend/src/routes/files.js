import express from 'express';
import { body, param, query } from 'express-validator';
import FileController from '../controllers/fileController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { uploadFile, handleUploadError } from '../middleware/upload.js';
import cors from 'cors';

// CORS配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true,
  optionsSuccessStatus: 200
};

const router = express.Router();

// 验证规则
const uploadValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('显示名称长度必须在1-255个字符之间'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('描述不能超过1000个字符'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('分类不能超过100个字符'),
  body('accessLevel')
    .optional()
    .isIn(['public', 'private', 'friends', 'link'])
    .withMessage('无效的访问级别')
];

const updateFileValidation = [
  param('fileId').isMongoId().withMessage('无效的文件ID'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('显示名称长度必须在1-255个字符之间'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('描述不能超过1000个字符'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('分类不能超过100个字符'),
  body('accessLevel')
    .optional()
    .isIn(['public', 'private', 'friends', 'link'])
    .withMessage('无效的访问级别'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic必须是布尔值')
];

const fileIdValidation = [
  param('fileId').isMongoId().withMessage('无效的文件ID')
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

// 文件上传
router.post('/upload', 
  authenticateToken,
  uploadFile,
  handleUploadError,
  uploadValidation,
  FileController.uploadFile
);

// 获取文件列表（公开接口，支持可选认证）
router.get('/',
  optionalAuth,
  paginationValidation,
  FileController.getFiles
);

// 搜索文件
router.get('/search',
  optionalAuth,
  query('q')
    .notEmpty()
    .trim()
    .isLength({ min: 2 })
    .withMessage('搜索关键词至少需要2个字符'),
  paginationValidation,
  FileController.searchFiles
);

// 获取我的文件
router.get('/my',
  authenticateToken,
  paginationValidation,
  FileController.getMyFiles
);

// 获取用户文件统计
router.get('/stats/:userId',
  authenticateToken,
  param('userId').isMongoId().withMessage('无效的用户ID'),
  FileController.getUserFileStats
);

// 通过分享链接获取文件
router.get('/share/:shareLink',
  param('shareLink').isUUID().withMessage('无效的分享链接'),
  FileController.getFileByShareLink
);

// 获取文件详情
router.get('/:fileId',
  optionalAuth,
  fileIdValidation,
  FileController.getFileById
);

// 下载文件
router.get('/:fileId/download',
  optionalAuth,
  fileIdValidation,
  FileController.downloadFile
);

// 获取缩略图 - 添加CORS支持
router.get('/:fileId/thumbnail',
  cors(corsOptions),
  optionalAuth,
  fileIdValidation,
  FileController.getThumbnail
);

// 更新文件信息
router.put('/:fileId',
  authenticateToken,
  updateFileValidation,
  FileController.updateFile
);

// 删除文件
router.delete('/:fileId',
  authenticateToken,
  fileIdValidation,
  FileController.deleteFile
);

// 切换点赞状态
router.post('/:fileId/like',
  authenticateToken,
  fileIdValidation,
  FileController.toggleLike
);

// 生成分享链接
router.post('/:fileId/share',
  authenticateToken,
  fileIdValidation,
  body('expiresIn')
    .optional()
    .isInt({ min: 1, max: 8760 })
    .withMessage('过期时间必须在1-8760小时之间'),
  FileController.generateShareLink
);

// 批量删除文件
router.delete('/',
  authenticateToken,
  body('fileIds')
    .isArray({ min: 1 })
    .withMessage('请提供要删除的文件ID列表'),
  body('fileIds.*')
    .isMongoId()
    .withMessage('文件ID格式不正确'),
  FileController.batchDeleteFiles
);

export default router;
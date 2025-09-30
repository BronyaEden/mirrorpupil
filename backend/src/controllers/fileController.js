import FileService from '../services/fileService.js';
import { validationResult } from 'express-validator';
import { User } from '../models/index.js';

class FileController {
  // 上传文件
  async uploadFile(req, res) {
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请选择要上传的文件'
        });
      }

      const uploaderInfo = {
        userId: req.user.userId,
        displayName: req.body.displayName,
        description: req.body.description,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        category: req.body.category,
        isPublic: req.body.isPublic !== 'false',
        accessLevel: req.body.accessLevel || 'public'
      };

      const file = await FileService.uploadFile(req.file, uploaderInfo);

      res.status(201).json({
        success: true,
        message: '文件上传成功',
        data: { file }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取文件列表
  async getFiles(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        fileType: req.query.fileType,
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        uploaderId: req.query.uploaderId,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        searchTerm: req.query.search,
        userId: req.user?.userId
      };

      const result = await FileService.getFiles(options);

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

  // 获取基础文件列表（仅包含基本信息，不包含大字段如data和thumbnailData）
  async getBasicFiles(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        fileType: req.query.fileType,
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        uploaderId: req.query.uploaderId,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        searchTerm: req.query.search,
        userId: req.user?.userId,
        basicInfoOnly: true // 标记只需要基础信息
      };

      const result = await FileService.getFiles(options);

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

  // 获取文件详情
  async getFileById(req, res) {
    try {
      const { fileId } = req.params;
      const file = await FileService.getFileById(fileId, req.user?.userId);

      res.json({
        success: true,
        data: { file }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权访问') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 通过分享链接获取文件
  async getFileByShareLink(req, res) {
    try {
      const { shareLink } = req.params;
      const file = await FileService.getFileByShareLink(shareLink);

      res.json({
        success: true,
        data: { file }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // 下载文件
  async downloadFile(req, res) {
    try {
      const { fileId } = req.params;
      const { file, fileData, filename } = await FileService.downloadFile(
        fileId, 
        req.user?.userId
      );

      // 设置响应头，正确处理中文文件名编码
      res.set('Content-Type', file.mimeType);
      
      // 使用RFC 5987标准编码文件名，支持中文等非ASCII字符
      const encodedFilename = encodeURIComponent(filename);
      res.set('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
      
      res.set('Content-Length', fileData.length);

      // 发送文件数据
      res.send(fileData);
    } catch (error) {
      const statusCode = error.message.includes('无权访问') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取缩略图
  async getThumbnail(req, res) {
    try {
      const { fileId } = req.params;
      const { data, mimeType } = await FileService.getThumbnail(fileId);

      // 设置响应头
      res.set('Content-Type', mimeType);
      res.set('Content-Length', data.length);
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');

      // 发送缩略图数据
      res.send(data);
    } catch (error) {
      // 对于404错误，返回一个默认的占位符图片而不是错误响应
      if (error.message.includes('文件不存在') || error.message.includes('缩略图不存在')) {
        // 返回一个透明的1x1像素PNG图片作为占位符
        const placeholder = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          'base64'
        );
      
        res.set('Content-Type', 'image/png');
        res.set('Content-Length', placeholder.length);
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.status(200).send(placeholder);
      } else {
        // 其他错误返回错误响应
        const statusCode = error.message.includes('无权访问') ? 403 : 404;
        res.status(statusCode).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // 删除文件
  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      const result = await FileService.deleteFile(fileId, req.user.userId);

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

  // 更新文件信息
  async updateFile(req, res) {
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

      const { fileId } = req.params;
      const file = await FileService.updateFile(fileId, req.body, req.user.userId);

      res.json({
        success: true,
        message: '文件信息更新成功',
        data: { file }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权修改') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 切换点赞状态
  async toggleLike(req, res) {
    try {
      const { fileId } = req.params;
      const result = await FileService.toggleLike(fileId, req.user.userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // 搜索文件
  async searchFiles(req, res) {
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
        limit: parseInt(req.query.limit) || 20,
        fileType: req.query.fileType,
        userId: req.user?.userId
      };

      const result = await FileService.searchFiles(searchTerm, options);

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

  // 获取用户文件统计
  async getUserFileStats(req, res) {
    try {
      const { userId } = req.params;
      
      // 如果不是查看自己的统计，检查用户是否存在且是公开的
      if (userId !== req.user.userId) {
        const user = await User.findById(userId);
        if (!user || !user.isActive) {
          return res.status(404).json({
            success: false,
            message: '用户不存在或已被禁用'
          });
        }
        // 对于公开用户，允许查看基本的文件统计（不包含敏感信息）
      }

      const stats = await FileService.getUserFileStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取我的文件
  async getMyFiles(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        fileType: req.query.fileType,
        category: req.query.category,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        uploaderId: req.user.userId,
        userId: req.user.userId // 用于权限检查
      };

      const result = await FileService.getFiles(options);

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

  // 批量删除文件
  async batchDeleteFiles(req, res) {
    try {
      const { fileIds } = req.body;
      
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供要删除的文件ID列表'
        });
      }

      const results = [];
      for (const fileId of fileIds) {
        try {
          await FileService.deleteFile(fileId, req.user.userId);
          results.push({ fileId, success: true });
        } catch (error) {
          results.push({ fileId, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.json({
        success: true,
        message: `成功删除 ${successCount} 个文件，失败 ${failCount} 个`,
        data: { results }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 生成分享链接
  async generateShareLink(req, res) {
    try {
      const { fileId } = req.params;
      const { expiresIn } = req.body; // 过期时间（小时）

      const updateData = { 
        accessLevel: 'link'
      };

      if (expiresIn) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
        updateData.expiresAt = expiresAt;
      }

      const file = await FileService.updateFile(fileId, updateData, req.user.userId);

      res.json({
        success: true,
        message: '分享链接生成成功',
        data: {
          shareLink: file.shareLink,
          shareUrl: `${req.protocol}://${req.get('host')}/api/files/share/${file.shareLink}`,
          expiresAt: file.expiresAt
        }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权修改') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new FileController();
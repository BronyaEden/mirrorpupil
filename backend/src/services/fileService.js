import { File, User } from '../models/index.js';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

class FileService {
  // 上传文件
  async uploadFile(fileData, uploaderInfo) {
    const {
      originalname,
      filename,
      mimetype,
      size,
      path: filePath,
      buffer
    } = fileData;

    const {
      userId,
      displayName,
      description = '',
      tags = [],
      category = '',
      isPublic = true,
      accessLevel = 'public'
    } = uploaderInfo;

    // 确定文件类型
    const fileType = this.determineFileType(mimetype);
    
    // 生成文件URL
    const fileUrl = `/uploads/${filename}`;
    
    // 创建文件记录
    const file = new File({
      filename,
      originalName: originalname,
      displayName: displayName || originalname,
      description,
      fileType,
      mimeType: mimetype,
      fileSize: size,
      fileUrl,
      uploaderId: userId,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      category,
      isPublic,
      accessLevel
    });

    // 如果是图片，生成缩略图
    if (fileType === 'image' && buffer) {
      try {
        const thumbnailFilename = `thumb_${filename}`;
        const thumbnailPath = path.join('uploads', thumbnailFilename);
        
        await sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
          
        file.thumbnailUrl = `/uploads/${thumbnailFilename}`;
        
        // 获取图片元数据
        const metadata = await sharp(buffer).metadata();
        file.metadata = {
          width: metadata.width,
          height: metadata.height
        };
      } catch (error) {
        console.error('生成缩略图失败:', error);
      }
    }

    // 生成分享链接（如果需要）
    if (accessLevel === 'link') {
      file.shareLink = uuidv4();
    }

    await file.save();
    
    // 填充上传者信息
    await file.populate('uploaderId', 'username avatar');
    
    return file;
  }

  // 获取文件列表
  async getFiles(options = {}) {
    const {
      page = 1,
      limit = 20,
      fileType,
      category,
      tags,
      uploaderId,
      isPublic = true,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      searchTerm,
      userId // 当前用户ID，用于权限判断
    } = options;

    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query = { isActive: true };
    
    // 权限过滤
    if (!userId) {
      // 未登录用户只能看公开文件
      query.isPublic = true;
      query.accessLevel = 'public';
    } else {
      // 登录用户可以看到自己的文件和公开文件
      query.$or = [
        { isPublic: true },
        { uploaderId: userId }
      ];
    }
    
    // 文件类型过滤
    if (fileType) {
      query.fileType = fileType;
    }
    
    // 分类过滤
    if (category) {
      query.category = category;
    }
    
    // 标签过滤
    if (tags && tags.length > 0) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }
    
    // 上传者过滤
    if (uploaderId) {
      query.uploaderId = uploaderId;
    }
    
    // 搜索功能
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }
    
    // 排序配置
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [files, total] = await Promise.all([
      File.find(query)
        .populate('uploaderId', 'username avatar')
        .sort(sortConfig)
        .skip(skip)
        .limit(limit),
      File.countDocuments(query)
    ]);
    
    return {
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 获取文件详情
  async getFileById(fileId, userId = null) {
    const file = await File.findById(fileId)
      .populate('uploaderId', 'username avatar bio')
      .populate('likes.user', 'username avatar');
    
    if (!file || !file.isActive) {
      throw new Error('文件不存在');
    }
    
    // 权限检查
    if (!this.canAccessFile(file, userId)) {
      throw new Error('无权访问此文件');
    }
    
    // 增加查看次数
    await file.incrementView();
    
    return file;
  }

  // 通过分享链接获取文件
  async getFileByShareLink(shareLink) {
    const file = await File.findOne({ shareLink, isActive: true })
      .populate('uploaderId', 'username avatar bio');
    
    if (!file) {
      throw new Error('分享链接无效或已过期');
    }
    
    // 检查是否过期
    if (file.expiresAt && file.expiresAt < new Date()) {
      throw new Error('分享链接已过期');
    }
    
    return file;
  }

  // 下载文件
  async downloadFile(fileId, userId = null) {
    const file = await this.getFileById(fileId, userId);
    
    // 检查文件是否存在
    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error('文件不存在或已被删除');
    }
    
    // 增加下载次数
    await file.incrementDownload();
    
    return {
      file,
      filePath,
      filename: file.originalName
    };
  }

  // 删除文件
  async deleteFile(fileId, userId) {
    const file = await File.findById(fileId);
    
    if (!file || !file.isActive) {
      throw new Error('文件不存在');
    }
    
    // 权限检查：只有文件上传者可以删除
    if (file.uploaderId.toString() !== userId) {
      throw new Error('无权删除此文件');
    }
    
    // 软删除
    file.isActive = false;
    await file.save();
    
    // 删除物理文件（异步进行，不影响响应）
    this.deletePhysicalFile(file.filename, file.thumbnailUrl);
    
    return { message: '文件删除成功' };
  }

  // 更新文件信息
  async updateFile(fileId, updateData, userId) {
    const file = await File.findById(fileId);
    
    if (!file || !file.isActive) {
      throw new Error('文件不存在');
    }
    
    // 权限检查
    if (file.uploaderId.toString() !== userId) {
      throw new Error('无权修改此文件');
    }
    
    const allowedUpdates = [
      'displayName', 'description', 'tags', 'category', 
      'isPublic', 'accessLevel'
    ];
    
    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });
    
    // 如果访问级别改为链接分享，生成分享链接
    if (updates.accessLevel === 'link' && !file.shareLink) {
      updates.shareLink = uuidv4();
    }
    
    Object.assign(file, updates);
    await file.save();
    
    return file;
  }

  // 切换点赞状态
  async toggleLike(fileId, userId) {
    const file = await File.findById(fileId);
    
    if (!file || !file.isActive) {
      throw new Error('文件不存在');
    }
    
    await file.toggleLike(userId);
    
    return {
      isLiked: file.isLikedBy(userId),
      likeCount: file.likeCount
    };
  }

  // 搜索文件
  async searchFiles(searchTerm, options = {}) {
    const {
      page = 1,
      limit = 20,
      fileType,
      userId
    } = options;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('搜索关键词至少需要2个字符');
    }
    
    return this.getFiles({
      ...options,
      searchTerm: searchTerm.trim(),
      page,
      limit,
      fileType,
      userId
    });
  }

  // 获取用户的文件统计
  async getUserFileStats(userId) {
    const stats = await File.aggregate([
      { $match: { uploaderId: mongoose.Types.ObjectId(userId), isActive: true } },
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);
    
    const totalFiles = await File.countDocuments({ 
      uploaderId: userId, 
      isActive: true 
    });
    
    const totalSize = await File.aggregate([
      { $match: { uploaderId: mongoose.Types.ObjectId(userId), isActive: true } },
      { $group: { _id: null, total: { $sum: '$fileSize' } } }
    ]);
    
    return {
      totalFiles,
      totalSize: totalSize[0]?.total || 0,
      byType: stats
    };
  }

  // 辅助方法：确定文件类型
  determineFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || 
        mimeType.includes('document') || 
        mimeType.includes('text/') ||
        mimeType.includes('application/')) return 'document';
    return 'other';
  }

  // 辅助方法：检查文件访问权限
  canAccessFile(file, userId) {
    // 公开文件所有人都可以访问
    if (file.isPublic && file.accessLevel === 'public') {
      return true;
    }
    
    // 如果没有用户ID，只能访问公开文件
    if (!userId) {
      return false;
    }
    
    // 文件上传者总是可以访问
    if (file.uploaderId._id.toString() === userId) {
      return true;
    }
    
    // 其他权限级别的检查
    switch (file.accessLevel) {
      case 'private':
        return false;
      case 'friends':
        // TODO: 检查好友关系
        return false;
      case 'link':
        return false; // 需要通过分享链接访问
      default:
        return file.isPublic;
    }
  }

  // 辅助方法：删除物理文件
  async deletePhysicalFile(filename, thumbnailUrl) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      await fs.unlink(filePath);
      
      if (thumbnailUrl) {
        const thumbnailPath = path.join(process.cwd(), 'uploads', 
          path.basename(thumbnailUrl));
        await fs.unlink(thumbnailPath);
      }
    } catch (error) {
      console.error('删除物理文件失败:', error);
    }
  }
}

export default new FileService();
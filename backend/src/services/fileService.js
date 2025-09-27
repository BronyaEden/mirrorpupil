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
    
    // 生成文件URL - 现在指向API端点而不是文件系统路径
    const fileUrl = `/api/files/${uuidv4()}/download`;
    
    // 创建文件记录，包含文件数据
    const file = new File({
      filename: `${uuidv4()}${path.extname(originalname)}`,
      originalName: originalname,
      displayName: displayName || originalname,
      description,
      fileType,
      mimeType: mimetype,
      fileSize: size,
      // 将文件数据存储在数据库中
      data: buffer,
      fileUrl,
      uploaderId: userId,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      category,
      isPublic,
      accessLevel
    });

    // 如果是图片，生成缩略图
    if (fileType === 'image' && buffer && buffer.length > 0) {
      try {
        console.log('开始生成缩略图:', filename);
        
        // 生成缩略图数据并存储在数据库中，而不是文件系统
        const thumbnailBuffer = await sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
          
        // 将缩略图数据存储在文件记录中
        file.thumbnailData = thumbnailBuffer;
        console.log('缩略图生成成功');
        
        // 获取图片元数据
        const metadata = await sharp(buffer).metadata();
        file.metadata = {
          width: metadata.width,
          height: metadata.height
        };
      } catch (error) {
        console.error('生成缩略图失败:', error);
      }
    } else {
      console.log('不生成缩略图 - 文件类型:', fileType, '缓冲区大小:', buffer ? buffer.length : '无缓冲区');
    }

    // 生成分享链接（如果需要）
    if (accessLevel === 'link') {
      file.shareLink = uuidv4();
    }

    await file.save();
    
    // 现在文件已保存，可以设置缩略图URL了
    if (file.thumbnailData) {
      file.thumbnailUrl = `/api/files/${file._id}/thumbnail`;
      await file.save(); // 保存更新后的缩略图URL
    }
    
    // 填充上传者信息
    await file.populate('uploaderId', 'username avatar');
    
    // 更新用户文件统计
    await this.updateUserFileStats(userId);
    
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
    
    // 增加下载次数
    await file.incrementDownload();
    
    // 更新用户文件统计
    await this.updateUserFileStats(file.uploaderId);
    
    // 返回文件数据而不是文件路径
    return {
      file,
      fileData: file.data, // 文件数据来自数据库
      filename: file.originalName
    };
  }

  // 获取缩略图
  async getThumbnail(fileId) {
    const file = await File.findById(fileId);
    
    if (!file || !file.isActive) {
      throw new Error('文件不存在');
    }
    
    // 如果是图片文件但没有缩略图数据，返回一个默认的占位符图片
    if (file.fileType === 'image' && !file.thumbnailData) {
      // 生成一个简单的占位符图片
      const placeholder = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64'
      );
      return {
        data: placeholder,
        mimeType: 'image/png'
      };
    }
    
    // 如果不是图片文件，也返回占位符
    if (file.fileType !== 'image') {
      const placeholder = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64'
      );
      return {
        data: placeholder,
        mimeType: 'image/png'
      };
    }
    
    return {
      data: file.thumbnailData,
      mimeType: file.mimeType
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
    
    // 保存上传者ID用于后续更新统计
    const uploaderId = file.uploaderId;
    
    // 软删除 - 设置deletedAt时间
    file.isActive = false;
    file.deletedAt = new Date();
    await file.save();
    
    // 更新用户文件统计
    await this.updateUserFileStats(uploaderId);
    
    return { message: '文件已删除，12小时内可恢复' };
  }

  // 恢复被软删除的文件
  async restoreFile(fileId) {
    const file = await File.findById(fileId);
    
    if (!file) {
      throw new Error('文件不存在');
    }
    
    // 检查文件是否已被删除
    if (file.isActive) {
      throw new Error('文件未被删除');
    }
    
    // 检查是否超过12小时恢复期限
    const deletedTime = new Date(file.deletedAt);
    const currentTime = new Date();
    const hoursSinceDeletion = (currentTime - deletedTime) / (1000 * 60 * 60);
    
    if (hoursSinceDeletion > 12) {
      throw new Error('文件已超过12小时恢复期限，无法恢复');
    }
    
    // 恢复文件
    file.isActive = true;
    file.deletedAt = null;
    await file.save();
    
    // 更新用户文件统计
    await this.updateUserFileStats(file.uploaderId);
    
    return { message: '文件恢复成功' };
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
    
    // 更新用户文件统计
    await this.updateUserFileStats(file.uploaderId);
    
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
    // 按文件类型分组统计
    const byType = await File.aggregate([
      { $match: { uploaderId: userId, isActive: true } },
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);
    
    // 获取各种统计数据
    const totalFiles = await File.countDocuments({ 
      uploaderId: userId, 
      isActive: true 
    });
    
    // 计算总浏览量、下载量和点赞数
    const stats = await File.aggregate([
      { $match: { uploaderId: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalDownloads: { $sum: '$downloadCount' },
          totalLikes: { $sum: '$likeCount' }
        }
      }
    ]);
    
    const totalViews = stats[0]?.totalViews || 0;
    const totalDownloads = stats[0]?.totalDownloads || 0;
    const totalLikes = stats[0]?.totalLikes || 0;
    
    return {
      totalFiles,
      totalViews,
      totalDownloads,
      totalLikes,
      byType
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
  
  // 更新用户文件统计信息
  async updateUserFileStats(userId) {
    const stats = await this.getUserFileStats(userId);
    
    await User.findByIdAndUpdate(userId, {
      fileStats: {
        totalFiles: stats.totalFiles,
        totalViews: stats.totalViews,
        totalDownloads: stats.totalDownloads,
        totalLikes: stats.totalLikes
      }
    });
    
    return stats;
  }
}

export default new FileService();
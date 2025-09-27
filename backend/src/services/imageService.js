import { Image } from '../models/index.js';
import sharp from 'sharp';

class ImageService {
  // 上传图片
  async uploadImage(file, userId, options = {}) {
    try {
      // 检查文件是否存在
      if (!file) {
        throw new Error('文件不存在');
      }
      
      // 检查文件buffer是否存在
      if (!file.buffer) {
        throw new Error('文件数据不存在');
      }
      
      // 验证文件类型
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(`不支持的图片格式: ${file.mimetype}`);
      }
      
      // 验证文件大小（最大5MB）
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`图片文件大小不能超过5MB，当前文件大小: ${file.size} bytes`);
      }
      
      // 处理图片（调整大小和压缩）
      let processedBuffer;
      
      if (options.isAvatar) {
        // 处理头像图片（200x200）
        processedBuffer = await sharp(file.buffer)
          .resize(200, 200, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();
      } else if (options.isCover) {
        // 处理背景图片（1920x600）
        processedBuffer = await sharp(file.buffer)
          .resize(1920, 600, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();
      } else {
        // 处理普通图片（最大宽度1920px）
        const metadata = await sharp(file.buffer).metadata();
        
        if (metadata.width > 1920) {
          processedBuffer = await sharp(file.buffer)
            .resize(1920, null, { withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
        } else {
          processedBuffer = await sharp(file.buffer)
            .jpeg({ quality: 80 })
            .toBuffer();
        }
      }
      
      // 确定MIME类型
      const mimeType = 'image/jpeg';
      
      // 创建图片文档
      const image = new Image({
        data: processedBuffer,
        mimeType: mimeType,
        size: processedBuffer.length,
        filename: file.originalname,
        uploadedBy: userId,
        isAvatar: options.isAvatar || false,
        isCover: options.isCover || false
      });
      
      // 保存到数据库
      const savedImage = await image.save();
      
      return {
        success: true,
        image: savedImage
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`图片上传失败: ${error.message}`);
    }
  }
  
  // 获取图片
  async getImageById(imageId) {
    try {
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('图片不存在');
      }
      
      return image;
    } catch (error) {
      throw new Error(`获取图片失败: ${error.message}`);
    }
  }
  
  // 删除图片
  async deleteImage(imageId) {
    try {
      const image = await Image.findByIdAndDelete(imageId);
      
      if (!image) {
        throw new Error('图片不存在');
      }
      
      return {
        success: true,
        message: '图片删除成功'
      };
    } catch (error) {
      throw new Error(`删除图片失败: ${error.message}`);
    }
  }
}

export default new ImageService();
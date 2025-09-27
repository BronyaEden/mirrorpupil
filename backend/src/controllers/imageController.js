import ImageService from '../services/imageService.js';

class ImageController {
  // 获取图片数据
  async getImage(req, res) {
    try {
      const { imageId } = req.params;
      const origin = req.get('Origin');
      const userAgent = req.get('User-Agent');
      const referer = req.get('Referer');
      
      console.log('=== 图片请求处理开始 ===');
      console.log('请求参数:', { imageId, origin, userAgent, referer });
      console.log('请求头:', req.headers);
      
      if (!imageId) {
        console.log('错误: 图片ID缺失');
        return res.status(400).json({
          success: false,
          message: '图片ID是必需的'
        });
      }
      
      // 验证图片ID格式
      if (!/^[0-9a-fA-F]{24}$/.test(imageId)) {
        console.log('错误: 图片ID格式无效');
        return res.status(400).json({
          success: false,
          message: '无效的图片ID格式'
        });
      }
      
      console.log('正在从数据库获取图片...');
      const image = await ImageService.getImageById(imageId);
      
      if (!image) {
        console.log('错误: 图片不存在');
        return res.status(404).json({
          success: false,
          message: '图片不存在'
        });
      }
      
      console.log('图片信息:', {
        id: image._id,
        mimeType: image.mimeType,
        size: image.size,
        filename: image.filename,
        isAvatar: image.isAvatar,
        isCover: image.isCover
      });
      
      // 设置响应头
      res.set('Content-Type', image.mimeType);
      res.set('Cache-Control', 'public, max-age=31536000'); // 缓存1年
      res.set('Content-Length', image.data.length);
      
      // 添加调试信息
      res.set('X-Image-Id', imageId);
      res.set('X-Image-Type', image.isAvatar ? 'avatar' : (image.isCover ? 'cover' : 'other'));
      
      // 修复Cross-Origin-Resource-Policy问题
      // 设置为cross-origin允许跨域访问
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      
      console.log('=== 图片发送成功 ===');
      
      // 返回图片二进制数据
      res.send(image.data);
    } catch (error) {
      console.error('=== 图片获取错误 ===');
      console.error('错误详情:', {
        imageId: req.params.imageId,
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
  
  // 获取图片信息（不返回图片数据）
  async getImageInfo(req, res) {
    try {
      const { imageId } = req.params;
      
      if (!imageId) {
        return res.status(400).json({
          success: false,
          message: '图片ID是必需的'
        });
      }
      
      const image = await ImageService.getImageById(imageId);
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: '图片不存在'
        });
      }
      
      // 返回图片信息，不包含实际数据
      res.json({
        success: true,
        data: {
          id: image._id,
          mimeType: image.mimeType,
          size: image.size,
          filename: image.filename,
          isAvatar: image.isAvatar,
          isCover: image.isCover,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt
        }
      });
    } catch (error) {
      console.error('获取图片信息错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ImageController();
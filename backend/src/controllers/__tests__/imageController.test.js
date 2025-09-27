import ImageController from '../imageController.js';
import ImageService from '../../services/imageService.js';

// Mock ImageService
jest.mock('../../services/imageService.js');

describe('ImageController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      get: jest.fn().mockReturnValue('localhost:3000') // 修复：添加get方法的模拟并返回值
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('getImage', () => {
    it('should return 400 if imageId is missing', async () => {
      await ImageController.getImage(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '图片ID是必需的'
      });
    });

    it('should return image data successfully', async () => {
      req.params.imageId = 'image-id';
      
      const mockImage = {
        _id: 'image-id',
        data: Buffer.from('image-data'),
        mimeType: 'image/jpeg',
        size: 1000
      };
      
      ImageService.getImageById.mockResolvedValue(mockImage);
      
      await ImageController.getImage(req, res);
      
      expect(ImageService.getImageById).toHaveBeenCalledWith('image-id');
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=31536000');
      expect(res.send).toHaveBeenCalledWith(Buffer.from('image-data'));
    });

    it('should return 404 if image is not found', async () => {
      req.params.imageId = 'non-existent-id';
      
      ImageService.getImageById.mockRejectedValue(new Error('图片不存在'));
      
      await ImageController.getImage(req, res);
      
      expect(ImageService.getImageById).toHaveBeenCalledWith('non-existent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '图片不存在'
      });
    });
  });
});
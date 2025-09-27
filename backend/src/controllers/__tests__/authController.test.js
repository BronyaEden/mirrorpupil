import AuthController from '../authController.js';
import AuthService from '../../services/authService.js';
import ImageService from '../../services/imageService.js';

// Mock services
jest.mock('../../services/authService.js');
jest.mock('../../services/imageService.js');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'user-id' },
      file: null,
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:5000')
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('uploadAvatar', () => {
    it('should return 400 if no file is provided', async () => {
      req.file = null;
      
      await AuthController.uploadAvatar(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '请上传头像文件'
      });
    });

    it('should upload avatar successfully', async () => {
      req.file = {
        buffer: Buffer.from('image-data'),
        mimetype: 'image/jpeg',
        size: 1000,
        originalname: 'avatar.jpg'
      };
      
      const mockImageResult = {
        success: true,
        image: {
          _id: 'image-id'
        }
      };
      
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        avatar: 'image-id'
      };
      
      ImageService.uploadImage.mockResolvedValue(mockImageResult);
      AuthService.updateProfile.mockResolvedValue(mockUser);
      
      await AuthController.uploadAvatar(req, res);
      
      expect(ImageService.uploadImage).toHaveBeenCalledWith(req.file, 'user-id', { isAvatar: true });
      expect(AuthService.updateProfile).toHaveBeenCalledWith('user-id', { avatar: 'image-id' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '头像上传成功',
        data: { user: mockUser }
      });
    });

    it('should return 500 if image upload fails', async () => {
      req.file = {
        buffer: Buffer.from('image-data'),
        mimetype: 'image/jpeg',
        size: 1000,
        originalname: 'avatar.jpg'
      };
      
      ImageService.uploadImage.mockRejectedValue(new Error('Upload failed'));
      
      await AuthController.uploadAvatar(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Upload failed'
      });
    });
  });

  describe('uploadCover', () => {
    it('should return 400 if no file is provided', async () => {
      req.file = null;
      
      await AuthController.uploadCover(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '请上传背景图文件'
      });
    });

    it('should upload cover image successfully', async () => {
      req.file = {
        buffer: Buffer.from('image-data'),
        mimetype: 'image/jpeg',
        size: 1000,
        originalname: 'cover.jpg'
      };
      
      const mockImageResult = {
        success: true,
        image: {
          _id: 'image-id'
        }
      };
      
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        coverImage: 'image-id'
      };
      
      ImageService.uploadImage.mockResolvedValue(mockImageResult);
      AuthService.updateProfile.mockResolvedValue(mockUser);
      
      await AuthController.uploadCover(req, res);
      
      expect(ImageService.uploadImage).toHaveBeenCalledWith(req.file, 'user-id', { isCover: true });
      expect(AuthService.updateProfile).toHaveBeenCalledWith('user-id', { coverImage: 'image-id' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '背景图上传成功',
        data: { user: mockUser }
      });
    });

    it('should return 500 if image upload fails', async () => {
      req.file = {
        buffer: Buffer.from('image-data'),
        mimetype: 'image/jpeg',
        size: 1000,
        originalname: 'cover.jpg'
      };
      
      ImageService.uploadImage.mockRejectedValue(new Error('Upload failed'));
      
      await AuthController.uploadCover(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Upload failed'
      });
    });
  });
});
import ImageService from '../imageService.js';
import { Image } from '../../models/index.js';
import sharp from 'sharp';

// Mock dependencies
jest.mock('../../models/index.js');
jest.mock('sharp');

describe('ImageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload avatar image successfully', async () => {
      // Mock sharp
      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-data'))
      };
      sharp.mockReturnValue(mockSharp);
      
      // Mock Image model
      const mockImage = {
        _id: 'image-id',
        data: Buffer.from('processed-image-data'),
        mimeType: 'image/jpeg',
        size: 1000,
        filename: 'avatar.jpg',
        uploadedBy: 'user-id',
        isAvatar: true,
        isCover: false,
        save: jest.fn().mockResolvedValue({
          _id: 'image-id',
          data: Buffer.from('processed-image-data'),
          mimeType: 'image/jpeg',
          size: 1000,
          filename: 'avatar.jpg',
          uploadedBy: 'user-id',
          isAvatar: true,
          isCover: false
        })
      };
      Image.mockImplementation(() => mockImage);
      
      const file = {
        buffer: Buffer.from('original-image-data'),
        mimetype: 'image/jpeg',
        size: 1000,
        originalname: 'avatar.jpg'
      };
      
      const result = await ImageService.uploadImage(file, 'user-id', { isAvatar: true });
      
      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image.isAvatar).toBe(true);
      expect(sharp).toHaveBeenCalledWith(file.buffer);
      expect(mockSharp.resize).toHaveBeenCalledWith(200, 200, { fit: 'cover' });
      expect(mockSharp.jpeg).toHaveBeenCalledWith({ quality: 80 });
      expect(mockImage.save).toHaveBeenCalled();
    });

    it('should upload cover image successfully', async () => {
      // Mock sharp
      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-data'))
      };
      sharp.mockReturnValue(mockSharp);
      
      // Mock Image model
      const mockImage = {
        _id: 'image-id',
        data: Buffer.from('processed-image-data'),
        mimeType: 'image/jpeg',
        size: 1000,
        filename: 'cover.jpg',
        uploadedBy: 'user-id',
        isAvatar: false,
        isCover: true,
        save: jest.fn().mockResolvedValue({
          _id: 'image-id',
          data: Buffer.from('processed-image-data'),
          mimeType: 'image/jpeg',
          size: 1000,
          filename: 'cover.jpg',
          uploadedBy: 'user-id',
          isAvatar: false,
          isCover: true
        })
      };
      Image.mockImplementation(() => mockImage);
      
      const file = {
        buffer: Buffer.from('original-image-data'),
        mimetype: 'image/jpeg',
        size: 1000,
        originalname: 'cover.jpg'
      };
      
      const result = await ImageService.uploadImage(file, 'user-id', { isCover: true });
      
      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image.isCover).toBe(true);
      expect(sharp).toHaveBeenCalledWith(file.buffer);
      expect(mockSharp.resize).toHaveBeenCalledWith(1920, 600, { fit: 'cover' });
      expect(mockSharp.jpeg).toHaveBeenCalledWith({ quality: 80 });
      expect(mockImage.save).toHaveBeenCalled();
    });

    it('should reject unsupported file types', async () => {
      const file = {
        buffer: Buffer.from('original-image-data'),
        mimetype: 'image/tiff',
        size: 1000,
        originalname: 'image.tiff'
      };
      
      await expect(ImageService.uploadImage(file, 'user-id'))
        .rejects
        .toThrow('图片上传失败: 不支持的图片格式');
    });

    it('should reject files that are too large', async () => {
      const file = {
        buffer: Buffer.from('original-image-data'),
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
        originalname: 'large-image.jpg'
      };
      
      await expect(ImageService.uploadImage(file, 'user-id'))
        .rejects
        .toThrow('图片上传失败: 图片文件大小不能超过5MB');
    });
  });

  describe('getImageById', () => {
    it('should get image by ID successfully', async () => {
      const mockImage = {
        _id: 'image-id',
        data: Buffer.from('image-data'),
        mimeType: 'image/jpeg',
        size: 1000
      };
      
      Image.findById.mockResolvedValue(mockImage);
      
      const result = await ImageService.getImageById('image-id');
      
      expect(result).toEqual(mockImage);
      expect(Image.findById).toHaveBeenCalledWith('image-id');
    });

    it('should throw error if image not found', async () => {
      Image.findById.mockResolvedValue(null);
      
      await expect(ImageService.getImageById('non-existent-id'))
        .rejects
        .toThrow('获取图片失败: 图片不存在');
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const mockImage = {
        _id: 'image-id'
      };
      
      Image.findByIdAndDelete.mockResolvedValue(mockImage);
      
      const result = await ImageService.deleteImage('image-id');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('图片删除成功');
      expect(Image.findByIdAndDelete).toHaveBeenCalledWith('image-id');
    });

    it('should throw error if image not found', async () => {
      Image.findByIdAndDelete.mockResolvedValue(null);
      
      await expect(ImageService.deleteImage('non-existent-id'))
        .rejects
        .toThrow('删除图片失败: 图片不存在');
    });
  });
});
import request from 'supertest';
import app from '../app.js';
import { File } from '../models/index.js';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Mock authentication middleware for testing
jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 'test-user-id' };
    next();
  }
}));

describe('文件名编码测试', () => {
  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/file-social-platform-test');
  });

  afterAll(async () => {
    // 清理测试数据并关闭连接
    await File.deleteMany({});
    await mongoose.connection.close();
  });

  test('应该正确处理包含中文的文件名', async () => {
    // 创建一个测试文件记录，包含中文文件名
    const testFileName = '测试文件中文名.txt';
    const testFile = new File({
      filename: `${uuidv4()}.txt`,
      originalName: testFileName,
      displayName: testFileName,
      description: '测试文件描述',
      fileType: 'document',
      mimeType: 'text/plain',
      fileSize: 1024,
      data: Buffer.from('测试文件内容'),
      fileUrl: `/api/files/${uuidv4()}/download`,
      uploaderId: 'test-user-id',
      isPublic: true,
      accessLevel: 'public'
    });
    
    await testFile.save();
    
    // 模拟下载请求
    const response = await request(app)
      .get(`/api/files/${testFile._id}/download`)
      .expect(200);
    
    // 检查Content-Disposition头是否正确编码
    const contentDisposition = response.headers['content-disposition'];
    expect(contentDisposition).toBeDefined();
    
    // 检查是否使用了UTF-8编码
    expect(contentDisposition).toMatch(/filename\*=UTF-8''/);
    
    // 检查文件数据是否正确返回
    expect(response.body).toBeInstanceOf(Buffer);
  });
});
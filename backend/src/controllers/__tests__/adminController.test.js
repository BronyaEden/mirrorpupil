import AdminController from '../adminController.js';
import AdminService from '../../services/adminService.js';
import FileService from '../../services/fileService.js';

// Mock services
jest.mock('../../services/adminService.js');
jest.mock('../../services/fileService.js');

describe('AdminController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'admin-id' },
      admin: { userId: 'admin-id', role: 'admin' },
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should get users successfully', async () => {
      const mockUsersResult = {
        users: [
          { _id: 'user1', username: 'testuser1' },
          { _id: 'user2', username: 'testuser2' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      };
      
      AdminService.getUsers.mockResolvedValue(mockUsersResult);
      
      req.query = { page: 1, limit: 10 };
      
      await AdminController.getUsers(req, res);
      
      expect(AdminService.getUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        role: undefined,
        isActive: undefined
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsersResult
      });
    });

    it('should return 500 if get users fails', async () => {
      AdminService.getUsers.mockRejectedValue(new Error('Database error'));
      
      await AdminController.getUsers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = {
        _id: 'new-user-id',
        username: 'newuser',
        email: 'newuser@example.com',
        role: 'user',
        toObject: jest.fn().mockReturnValue({
          _id: 'new-user-id',
          username: 'newuser',
          email: 'newuser@example.com',
          role: 'user'
        })
      };
      
      AdminService.createUser.mockResolvedValue(mockUser);
      
      req.body = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };
      
      await AdminController.createUser(req, res);
      
      expect(AdminService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '用户创建成功',
        data: { user: mockUser.toObject() }
      });
    });

    it('should return 500 if create user fails', async () => {
      AdminService.createUser.mockRejectedValue(new Error('Create failed'));
      
      req.body = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      await AdminController.createUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Create failed'
      });
    });
  });

  describe('getUserById', () => {
    it('should return 400 for invalid user ID', async () => {
      req.params.userId = 'invalid-id';
      
      await AdminController.getUserById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的用户ID'
      });
    });

    it('should get user by ID successfully', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        toObject: jest.fn().mockReturnValue({
          _id: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        })
      };
      
      AdminService.getUserById.mockResolvedValue(mockUser);
      
      req.params.userId = '507f1f77bcf86cd799439011';
      
      await AdminController.getUserById(req, res);
      
      expect(AdminService.getUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser }
      });
    });

    it('should return 404 if user not found', async () => {
      AdminService.getUserById.mockRejectedValue(new Error('用户不存在'));
      
      req.params.userId = '507f1f77bcf86cd799439011';
      
      await AdminController.getUserById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '用户不存在'
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockResult = { message: '文件已删除，12小时内可恢复' };
      
      FileService.deleteFile.mockResolvedValue(mockResult);
      
      req.params.fileId = '507f1f77bcf86cd799439011';
      req.user.userId = 'admin-id';
      
      await AdminController.deleteFile(req, res);
      
      expect(FileService.deleteFile).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'admin-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '文件已删除，12小时内可恢复'
      });
    });

    it('should return 403 if user has no permission to delete file', async () => {
      FileService.deleteFile.mockRejectedValue(new Error('无权删除此文件'));
      
      req.params.fileId = '507f1f77bcf86cd799439011';
      req.user.userId = 'admin-id';
      
      await AdminController.deleteFile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '无权删除此文件'
      });
    });
  });

  describe('getSystemStatus', () => {
    it('should get system status successfully', async () => {
      const mockStats = {
        users: {
          total: 100,
          active: 50,
          newToday: 5,
          admins: 2,
          moderators: 3
        },
        files: {
          total: 200,
          public: 150,
          uploadedToday: 10,
          totalSize: 1024000
        },
        messages: {
          total: 500,
          conversations: 50,
          today: 20
        },
        activity: {
          totalDownloads: 300,
          totalViews: 1000
        }
      };
      
      AdminService.getSystemStatus.mockResolvedValue(mockStats);
      
      await AdminController.getSystemStatus(req, res);
      
      expect(AdminService.getSystemStatus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          ...mockStats,
          server: expect.objectContaining({
            status: 'online'
          }),
          database: expect.objectContaining({
            status: expect.any(String),
            connections: expect.any(Number)
          })
        })
      });
    });
  });
});
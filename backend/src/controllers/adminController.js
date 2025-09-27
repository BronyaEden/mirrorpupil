import { User, File, Message, Conversation } from '../models/index.js';
import FileService from '../services/fileService.js';
import AdminService from '../services/adminService.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AdminController {
  // 管理员登录
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // 查找管理员用户
      const admin = await User.findOne({ 
        username, 
        role: { $in: ['admin', 'moderator'] } 
      }).select('+password');

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: '管理员账户不存在'
        });
      }

      // 验证密码
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 生成管理员token
      const adminToken = jwt.sign(
        { 
          userId: admin._id, 
          username: admin.username,
          role: admin.role,
          isAdmin: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // 管理员token有效期24小时
      );

      // 更新登录信息
      await admin.updateLastLogin();

      res.json({
        success: true,
        message: '管理员登录成功',
        data: {
          token: adminToken,
          admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取仪表板统计数据
  async getDashboardStats(req, res) {
    try {
      const stats = await AdminService.getSystemStatus();
      
      res.json({
        success: true,
        data: {
          ...stats,
          serverStatus: 'online'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取用户列表
  async getUsers(req, res) {
    try {
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        search: req.query.search,
        role: req.query.role,
        isActive: req.query.isActive
      };
      
      const result = await AdminService.getUsers(options);

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

  // 创建新用户
  async createUser(req, res) {
    try {
      const user = await AdminService.createUser(req.body);

      // 返回用户信息（包括密码）
      const userObj = user.toObject();
      // 注意：这里我们不删除密码字段，以便管理员可以查看密码
      // 在实际生产环境中，这可能是一个安全风险，需要谨慎处理

      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: { user: userObj }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取用户详细信息
  async getUserById(req, res) {
    try {
      const { userId } = req.params;

      // 验证用户ID
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const user = await AdminService.getUserById(userId);
      
      // 返回用户详细信息（包括密码）
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      const statusCode = error.message === '用户不存在' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 更新用户信息
  async updateUser(req, res) {
    try {
      const { userId } = req.params;

      // 验证用户ID
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const user = await AdminService.updateUser(userId, req.body);

      res.json({
        success: true,
        message: '用户信息更新成功',
        data: { user }
      });
    } catch (error) {
      const statusCode = error.message === '用户不存在' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 切换用户状态
  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;

      // 验证用户ID
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const user = await AdminService.toggleUserStatus(userId);

      res.json({
        success: true,
        message: `用户已${user.isActive ? '启用' : '禁用'}`,
        data: { user }
      });
    } catch (error) {
      const statusCode = error.message === '用户不存在' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 删除用户
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // 验证用户ID
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const result = await AdminService.deleteUser(userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === '用户不存在' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取文件列表
  async getFiles(req, res) {
    try {
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        search: req.query.search,
        fileType: req.query.fileType,
        isPublic: req.query.isPublic
      };
      
      const result = await AdminService.getFiles(options);

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

  // 删除文件
  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId; // 管理员ID

      // 使用文件服务删除文件（软删除）
      const result = await FileService.deleteFile(fileId, userId);

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

  // 批量删除文件
  async batchDeleteFiles(req, res) {
    try {
      const { fileIds } = req.body;
      const adminId = req.user.userId; // 管理员ID

      // 验证文件ID列表
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供要删除的文件ID列表'
        });
      }

      // 验证每个文件ID
      for (const fileId of fileIds) {
        if (!mongoose.isValidObjectId(fileId)) {
          return res.status(400).json({
            success: false,
            message: `无效的文件ID: ${fileId}`
          });
        }
      }

      // 批量软删除文件
      const results = await AdminService.batchDeleteFiles(fileIds, adminId);

      res.json({
        success: true,
        message: '批量删除操作完成',
        data: { results }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 恢复已删除文件
  async restoreFile(req, res) {
    try {
      const { fileId } = req.params;

      // 验证文件ID
      if (!mongoose.isValidObjectId(fileId)) {
        return res.status(400).json({
          success: false,
          message: '无效的文件ID'
        });
      }

      const result = await AdminService.restoreFile(fileId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === '文件不存在' ? 404 : 
                        error.message === '文件未被删除' ? 400 : 
                        error.message === '文件已超过12小时恢复期限，无法恢复' ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取系统日志
  async getSystemLogs(req, res) {
    try {
      const { page = 1, limit = 50, level, startDate, endDate } = req.query;
      
      // 这里可以实现日志查询逻辑
      // 目前返回模拟数据
      const logs = [
        {
          timestamp: new Date(),
          level: 'info',
          message: '用户登录',
          userId: 'user123',
          ip: '192.168.1.1'
        }
      ];

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: logs.length,
            pages: 1
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取系统状态
  async getSystemStatus(req, res) {
    try {
      const stats = await AdminService.getSystemStatus();
      
      // 检查数据库连接状态
      let databaseStatus = 'unknown';
      let databaseConnections = 0;
      
      try {
        // 检查Mongoose连接状态
        const mongooseState = mongoose.connection.readyState;
        if (mongooseState === 1) {
          databaseStatus = 'connected';
          // 获取活跃连接数
          databaseConnections = mongoose.connection.connections ? mongoose.connection.connections.length : 1;
        } else if (mongooseState === 0) {
          databaseStatus = 'disconnected';
        } else if (mongooseState === 2) {
          databaseStatus = 'connecting';
        } else if (mongooseState === 3) {
          databaseStatus = 'disconnecting';
        }
      } catch (dbError) {
        databaseStatus = 'error';
        console.error('数据库连接检查错误:', dbError);
      }

      const systemStatus = {
        ...stats,
        server: {
          status: 'online',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        },
        database: {
          status: databaseStatus,
          connections: databaseConnections
        }
      };

      res.json({
        success: true,
        data: systemStatus
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取数据分析
  async getAnalytics(req, res) {
    try {
      const { period = '7d' } = req.query;
      
      let dateRange;
      switch (period) {
        case '24h':
          dateRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      // 用户注册趋势
      const userRegistrations = await User.aggregate([
        { $match: { createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // 文件上传趋势
      const fileUploads = await File.aggregate([
        { $match: { createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            totalSize: { $sum: "$fileSize" }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // 文件类型分布
      const fileTypeDistribution = await File.aggregate([
        {
          $group: {
            _id: "$fileType",
            count: { $sum: 1 },
            totalSize: { $sum: "$fileSize" }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          userRegistrations,
          fileUploads,
          fileTypeDistribution
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AdminController();
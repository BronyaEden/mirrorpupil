import { User, File, Message, Conversation } from '../models/index.js';
import FileService from '../services/fileService.js';
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
        { expiresIn: '8h' } // 管理员token有效期8小时
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
      // 获取用户统计
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ 
        lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      const newUsersToday = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      // 获取文件统计
      const totalFiles = await File.countDocuments();
      const totalFileSize = await File.aggregate([
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
      ]);
      const publicFiles = await File.countDocuments({ isPublic: true });
      const filesUploadedToday = await File.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      // 获取消息统计
      const totalMessages = await Message.countDocuments();
      const totalConversations = await Conversation.countDocuments();
      const messagesToday = await Message.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      // 获取活动统计
      const totalDownloads = await File.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
      ]);
      const totalViews = await File.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]);

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers,
            newToday: newUsersToday
          },
          files: {
            total: totalFiles,
            public: publicFiles,
            uploadedToday: filesUploadedToday,
            totalSize: totalFileSize[0]?.totalSize || 0
          },
          messages: {
            total: totalMessages,
            conversations: totalConversations,
            today: messagesToday
          },
          activity: {
            totalDownloads: totalDownloads[0]?.totalDownloads || 0,
            totalViews: totalViews[0]?.totalViews || 0
          },
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
      const { page = 1, limit = 10, search, role, isActive } = req.query;
      
      // 构建查询条件
      const query = {};
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) {
        query.role = role;
      }
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const skip = (page - 1) * limit;
      
      // 获取用户列表
      const users = await User.find(query)
        .populate('followers', 'username')
        .populate('following', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // 获取每个用户的文件数量
      const usersWithStats = await Promise.all(users.map(async (user) => {
        const fileCount = await File.countDocuments({ uploaderId: user._id });
        return {
          ...user.toObject(),
          fileCount
        };
      }));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users: usersWithStats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
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

  // 更新用户信息
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // 验证用户ID
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      // 不允许修改密码通过此接口
      delete updates.password;
      delete updates._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '用户信息更新成功',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 切换用户状态
  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: `用户已${user.isActive ? '启用' : '禁用'}`,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取文件列表
  async getFiles(req, res) {
    try {
      const { page = 1, limit = 10, search, fileType, isPublic } = req.query;
      
      // 构建查询条件
      const query = {};
      if (search) {
        query.$or = [
          { filename: { $regex: search, $options: 'i' } },
          { displayName: { $regex: search, $options: 'i' } }
        ];
      }
      if (fileType) {
        query.fileType = fileType;
      }
      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }

      const skip = (page - 1) * limit;
      
      const files = await File.find(query)
        .populate('uploaderId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await File.countDocuments(query);

      res.json({
        success: true,
        data: {
          files,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
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
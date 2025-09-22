import AuthService from '../services/authService.js';
import { validationResult } from 'express-validator';

class AuthController {
  // 用户注册
  async register(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const result = await AuthService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: '注册成功',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 用户登录
  async login(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const result = await AuthService.login(req.body);
      
      res.json({
        success: true,
        message: '登录成功',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // 刷新令牌
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: '刷新令牌是必需的'
        });
      }

      const result = await AuthService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        message: '令牌刷新成功',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取用户信息
  async getProfile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.userId);
      
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // 更新用户信息
  async updateProfile(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const user = await AuthService.updateProfile(req.user.userId, req.body);
      
      res.json({
        success: true,
        message: '用户信息更新成功',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 修改密码
  async changePassword(req, res) {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const result = await AuthService.changePassword(req.user.userId, req.body);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 关注用户
  async followUser(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await AuthService.followUser(req.user.userId, userId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 取消关注
  async unfollowUser(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await AuthService.unfollowUser(req.user.userId, userId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 搜索用户
  async searchUsers(req, res) {
    try {
      const { q: query, page, limit } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词至少需要2个字符'
        });
      }

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        excludeUserId: req.user?.userId
      };

      const result = await AuthService.searchUsers(query.trim(), options);
      
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

  // 用户登出（可选：用于清除服务端session等）
  async logout(req, res) {
    try {
      // 这里可以添加清除服务端session、记录登出日志等逻辑
      res.json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取其他用户的公开信息
  async getUserPublicProfile(req, res) {
    try {
      const { userId } = req.params;
      
      const user = await AuthService.getProfile(userId);
      
      // 只返回公开信息
      const publicProfile = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        createdAt: user.createdAt
      };
      
      res.json({
        success: true,
        data: { user: publicProfile }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AuthController();
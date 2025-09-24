import AuthService from '../services/authService.js';
import { validationResult } from 'express-validator';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

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

  // 上传头像
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传头像文件'
        });
      }

      // 处理头像图片（调整大小和压缩）
      const avatarPath = path.join('uploads', req.file.filename);
      const processedAvatarPath = path.join('uploads', 'processed-' + req.file.filename);
      
      await sharp(avatarPath)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(processedAvatarPath);
      
      // 删除原始文件
      await fs.unlink(avatarPath);
      
      // 更新用户信息
      const avatarUrl = `/uploads/processed-${req.file.filename}`;
      const user = await AuthService.updateProfile(req.user.userId, { avatar: avatarUrl });
      
      res.json({
        success: true,
        message: '头像上传成功',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 上传背景图
  async uploadCover(req, res) {
    try {
      console.log('Upload cover request received', req.file);
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传背景图文件'
        });
      }

      // 处理背景图片（调整大小和压缩）
      const coverPath = path.join('uploads', req.file.filename);
      const processedCoverPath = path.join('uploads', 'processed-' + req.file.filename);
      console.log('Processing cover image', coverPath, processedCoverPath);
      
      await sharp(coverPath)
        .resize(1920, 600, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(processedCoverPath);
      
      // 删除原始文件
      await fs.unlink(coverPath);
      
      // 更新用户信息
      const coverUrl = `/uploads/processed-${req.file.filename}`;
      console.log('Updating user profile with coverUrl', coverUrl);
      const user = await AuthService.updateProfile(req.user.userId, { coverImage: coverUrl });
      console.log('User profile updated', user.coverImage);
      
      res.json({
        success: true,
        message: '背景图上传成功',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 更新用户名
  async updateUsername(req, res) {
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

      const { username } = req.body;
      
      // 检查用户名是否已被使用
      const existingUser = await AuthService.checkUsernameExists(username, req.user.userId);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该用户名已被使用'
        });
      }
      
      // 更新用户名
      const user = await AuthService.updateProfile(req.user.userId, { username });
      
      res.json({
        success: true,
        message: '用户名更新成功',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
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
        coverImage: user.coverImage,
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
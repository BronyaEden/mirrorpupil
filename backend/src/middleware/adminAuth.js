import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// 管理员认证中间件
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝：需要管理员权限'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 验证是否为管理员token
      if (!decoded.isAdmin) {
        return res.status(403).json({
          success: false,
          message: '访问被拒绝：需要管理员权限'
        });
      }

      // 获取用户信息并验证角色
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      if (!['admin', 'moderator'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: '访问被拒绝：需要管理员权限'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: '账户已被禁用'
        });
      }

      // 将用户信息添加到请求对象
      req.admin = {
        userId: user._id,
        username: user.username,
        role: user.role,
        email: user.email
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'token无效或已过期'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 统一管理员权限（不区分等级）
export const requireAdmin = (req, res, next) => {
  // 所有管理员（包括版主）都拥有相同权限
  if (!req.admin || !['admin', 'moderator'].includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: '访问被拒绝：需要管理员权限'
    });
  }
  next();
};

// 记录管理员操作日志
export const logAdminAction = (action) => {
  return (req, res, next) => {
    // 在请求处理完成后记录日志
    const originalSend = res.send;
    res.send = function(data) {
      // 记录操作日志
      const logData = {
        adminId: req.admin?.userId,
        adminUsername: req.admin?.username,
        adminRole: req.admin?.role,
        action,
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        statusCode: res.statusCode
      };

      // 这里可以将日志保存到数据库或文件
      console.log('Admin Action Log:', JSON.stringify(logData, null, 2));

      // 调用原始的send方法
      originalSend.call(this, data);
    };

    next();
  };
};
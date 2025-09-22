import AuthService from '../services/authService.js';

// JWT验证中间件
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌是必需的'
      });
    }

    const decoded = AuthService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: '访问令牌无效或已过期'
    });
  }
};

// 可选认证中间件（用于公开接口中获取用户信息）
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // 忽略令牌错误，继续处理请求
    next();
  }
};

// 管理员权限验证
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要登录'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '权限验证失败'
    });
  }
};
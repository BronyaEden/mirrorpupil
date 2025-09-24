import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

class AuthService {
  // 生成JWT令牌
  generateTokens(userId) {
    const payload = { userId };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  // 验证访问令牌
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
  
  // 验证刷新令牌
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  // 用户注册
  async register(userData) {
    const { username, email, password } = userData;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('该邮箱已被注册');
      }
      if (existingUser.username === username) {
        throw new Error('该用户名已被使用');
      }
    }
    
    // 创建新用户
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // 生成令牌
    const tokens = this.generateTokens(user._id);
    
    // 返回用户信息和令牌（不包含密码）
    const userObj = user.toObject();
    delete userObj.password;
    
    return {
      user: userObj,
      ...tokens
    };
  }
  
  // 用户登录
  async login(credentials) {
    const { email, password } = credentials;
    
    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new Error('邮箱或密码错误');
    }
    
    // 检查账户是否激活
    if (!user.isActive) {
      throw new Error('账户已被禁用');
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误');
    }
    
    // 更新最后登录时间
    await user.updateLastLogin();
    
    // 生成令牌
    const tokens = this.generateTokens(user._id);
    
    // 返回用户信息和令牌（不包含密码）
    const userObj = user.toObject();
    delete userObj.password;
    
    return {
      user: userObj,
      ...tokens
    };
  }
  
  // 刷新令牌
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('用户不存在或已被禁用');
      }
      
      // 生成新的访问令牌
      const tokens = this.generateTokens(user._id);
      
      return tokens;
    } catch (error) {
      throw new Error('刷新令牌无效');
    }
  }
  
  // 获取用户信息
  async getProfile(userId) {
    const user = await User.findById(userId)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return user;
  }
  
  // 检查用户名是否存在
  async checkUsernameExists(username, excludeUserId = null) {
    const query = { username };
    
    // 如果提供了排除的用户ID，则排除该用户
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    
    const existingUser = await User.findOne(query);
    return existingUser;
  }

  // 更新用户信息
  async updateProfile(userId, updateData) {
    console.log('Updating user profile', userId, updateData);
    const allowedUpdates = [
      'avatar', 'bio', 'location', 'website', 'preferences', 'coverImage', 'username'
    ];
    
    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });
    
    console.log('Filtered updates', updates);
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    console.log('Updated user', user.coverImage);
    return user;
  }
  
  // 修改密码
  async changePassword(userId, passwords) {
    const { currentPassword, newPassword } = passwords;
    
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      throw new Error('当前密码错误');
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    return { message: '密码修改成功' };
  }
  
  // 关注用户
  async followUser(userId, targetUserId) {
    if (userId === targetUserId) {
      throw new Error('不能关注自己');
    }
    
    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);
    
    if (!user || !targetUser) {
      throw new Error('用户不存在');
    }
    
    // 检查是否已关注
    if (user.following.includes(targetUserId)) {
      throw new Error('已关注该用户');
    }
    
    // 添加关注关系
    user.following.push(targetUserId);
    targetUser.followers.push(userId);
    
    await Promise.all([user.save(), targetUser.save()]);
    
    return { message: '关注成功' };
  }
  
  // 取消关注
  async unfollowUser(userId, targetUserId) {
    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);
    
    if (!user || !targetUser) {
      throw new Error('用户不存在');
    }
    
    // 移除关注关系
    user.following = user.following.filter(id => 
      id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(id => 
      id.toString() !== userId
    );
    
    await Promise.all([user.save(), targetUser.save()]);
    
    return { message: '取消关注成功' };
  }
  
  // 搜索用户
  async searchUsers(query, options = {}) {
    const { page = 1, limit = 20, excludeUserId } = options;
    const skip = (page - 1) * limit;
    
    const searchConditions = {
      $and: [
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { isActive: true }
      ]
    };
    
    // 排除指定用户
    if (excludeUserId) {
      searchConditions.$and.push({ _id: { $ne: excludeUserId } });
    }
    
    const [users, total] = await Promise.all([
      User.find(searchConditions)
        .select('username email avatar bio followersCount followingCount createdAt')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(searchConditions)
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default new AuthService();
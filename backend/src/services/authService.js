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
      // 注意：不要populate avatar 和 coverImage，因为前端需要的是ID而不是完整对象
    
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
    
    // 处理头像和背景图ID
    if (updates.avatar) {
      updates.avatar = updates.avatar.toString();
    }
    if (updates.coverImage) {
      updates.coverImage = updates.coverImage.toString();
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ); // 注意：不要populate avatar 和 coverImage，因为前端需要的是ID而不是完整对象
    
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
    
    // 优化搜索条件，使用更合理的匹配方式
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
        .select('username email avatar coverImage bio followers following createdAt isVerified')
        .skip(skip)
        .limit(limit)
        .sort({ followersCount: -1, createdAt: -1 }), // 按关注者数量和创建时间排序，使更相关的用户排在前面
      User.countDocuments(searchConditions)
    ]);
    
    // 确保返回的头像和背景图URL是完整的，并明确设置关注者和关注中数量
    const usersWithFullUrls = users.map(user => {
      // 不使用toObject，直接构建返回对象
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        // 明确计算关注者和关注中数量
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0
      };
    });
    
    return {
      users: usersWithFullUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // 获取用户的关注者列表
  async getUserFollowers(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    // 查找用户并填充关注者信息
    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'username avatar coverImage bio followers following createdAt isVerified',
        options: {
          skip: skip,
          limit: limit,
          sort: { followersCount: -1, createdAt: -1 }
        }
      });
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 获取关注者总数
    const total = user.followers.length;
    
    // 确保返回的头像和背景图URL是完整的，并明确设置关注者和关注中数量
    const followersWithFullUrls = user.followers.map(follower => {
      // 不使用toObject，直接构建返回对象
      return {
        _id: follower._id,
        username: follower.username,
        avatar: follower.avatar,
        coverImage: follower.coverImage,
        bio: follower.bio,
        createdAt: follower.createdAt,
        isVerified: follower.isVerified,
        // 明确计算关注者和关注中数量
        followersCount: follower.followers ? follower.followers.length : 0,
        followingCount: follower.following ? follower.following.length : 0
      };
    });
    
    return {
      users: followersWithFullUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // 获取用户的关注中列表
  async getUserFollowing(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    // 查找用户并填充关注中信息
    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'username avatar coverImage bio followers following createdAt isVerified',
        options: {
          skip: skip,
          limit: limit,
          sort: { followersCount: -1, createdAt: -1 }
        }
      });
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 获取关注中总数
    const total = user.following.length;
    
    // 确保返回的头像和背景图URL是完整的，并明确设置关注者和关注中数量
    const followingWithFullUrls = user.following.map(following => {
      // 不使用toObject，直接构建返回对象
      return {
        _id: following._id,
        username: following.username,
        avatar: following.avatar,
        coverImage: following.coverImage,
        bio: following.bio,
        createdAt: following.createdAt,
        isVerified: following.isVerified,
        // 明确计算关注者和关注中数量
        followersCount: following.followers ? following.followers.length : 0,
        followingCount: following.following ? following.following.length : 0
      };
    });
    
    return {
      users: followingWithFullUrls,
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
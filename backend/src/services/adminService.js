import { User, File, Message, Conversation } from '../models/index.js';

class AdminService {
  // 获取用户列表
  async getUsers(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive
    } = options;

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
    
    // 获取用户列表（包含密码字段）
    const users = await User.find(query)
      .select('+password')
      .populate('followers', 'username')
      .populate('following', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 获取每个用户的文件数量、关注者数量和关注数量
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const fileCount = await File.countDocuments({ uploaderId: user._id });
      const followersCount = user.followers ? user.followers.length : 0;
      const followingCount = user.following ? user.following.length : 0;
      // 为管理员返回包含密码的对象
      const userObject = user.toObject({ transform: (doc, ret) => {
        // 为管理员保留密码字段
        return ret;
      }});
      
      return {
        ...userObject,
        fileCount,
        followersCount,
        followingCount
      };
    }));

    const total = await User.countDocuments(query);

    return {
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 创建新用户
  async createUser(userData) {
    const { username, email, password, role = 'user' } = userData;

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
      password,
      role
    });

    await user.save();

    return user;
  }

  // 获取用户详细信息
  async getUserById(userId) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取用户的文件数量
    const fileCount = await File.countDocuments({ uploaderId: user._id });
    
    // 获取用户的关注者和关注数量
    const followersCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    // 为管理员返回包含密码的对象
    const userObject = user.toObject({ transform: (doc, ret) => {
      // 为管理员保留密码字段
      return ret;
    }});

    return {
      ...userObject,
      fileCount,
      followersCount,
      followingCount
    };
  }

  // 更新用户信息
  async updateUser(userId, updates) {
    // 移除不允许修改的字段
    delete updates._id;
    
    // 如果提供了密码，则需要特殊处理
    if (updates.password) {
      // 需要先找到用户，然后设置密码并保存，以触发密码加密中间件
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }
      
      // 更新其他字段
      Object.keys(updates).forEach(key => {
        if (key !== 'password' && key !== '_id') {
          user[key] = updates[key];
        }
      });
      
      // 如果提供了密码，则更新密码
      if (updates.password) {
        user.password = updates.password;
      }
      
      await user.save();
      return user;
    } else {
      // 如果没有提供密码，则使用普通更新
      delete updates.password;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('用户不存在');
      }

      return user;
    }
  }

  // 切换用户状态
  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  // 删除用户
  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 删除用户相关数据
    // 1. 删除用户上传的文件
    await File.deleteMany({ uploaderId: userId });
    
    // 2. 从其他用户的关注列表中移除该用户
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    
    // 3. 删除用户的消息
    await Message.deleteMany({ sender: userId });
    
    // 4. 删除用户的会话
    await Conversation.deleteMany({ participants: userId });
    
    // 5. 删除用户
    await User.findByIdAndDelete(userId);

    return { message: '用户删除成功' };
  }

  // 获取文件列表
  async getFiles(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      fileType,
      isPublic
    } = options;
    
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

    return {
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 批量删除文件
  async batchDeleteFiles(fileIds, adminId) {
    // 验证文件ID列表
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new Error('请提供要删除的文件ID列表');
    }

    // 批量软删除文件
    const results = [];
    for (const fileId of fileIds) {
      try {
        // 这里应该调用文件服务的删除方法
        // 但由于我们在管理员服务中，直接操作数据库
        const file = await File.findById(fileId);
        
        if (!file || !file.isActive) {
          results.push({ fileId, success: false, message: '文件不存在' });
          continue;
        }
        
        // 软删除 - 设置deletedAt时间
        file.isActive = false;
        file.deletedAt = new Date();
        await file.save();
        
        results.push({ fileId, success: true, message: '文件已删除，12小时内可恢复' });
      } catch (error) {
        results.push({ fileId, success: false, message: error.message });
      }
    }

    return results;
  }

  // 恢复文件
  async restoreFile(fileId) {
    const file = await File.findById(fileId);
    
    if (!file) {
      throw new Error('文件不存在');
    }
    
    // 检查文件是否已被删除
    if (file.isActive) {
      throw new Error('文件未被删除');
    }
    
    // 检查是否超过12小时恢复期限
    const deletedTime = new Date(file.deletedAt);
    const currentTime = new Date();
    const hoursSinceDeletion = (currentTime - deletedTime) / (1000 * 60 * 60);
    
    if (hoursSinceDeletion > 12) {
      throw new Error('文件已超过12小时恢复期限，无法恢复');
    }
    
    // 恢复文件
    file.isActive = true;
    file.deletedAt = null;
    await file.save();
    
    return { message: '文件恢复成功' };
  }

  // 获取系统状态
  async getSystemStatus() {
    // 获取用户统计
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // 获取管理员和版主统计
    const adminCount = await User.countDocuments({ role: 'admin' });
    const moderatorCount = await User.countDocuments({ role: 'moderator' });

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

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        admins: adminCount,
        moderators: moderatorCount
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
      }
    };
  }
}

export default new AdminService();
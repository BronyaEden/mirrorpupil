import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, '用户名是必填项'],
    unique: true,
    trim: true,
    minlength: [1, '用户名至少需要1个字符'],
    maxlength: [30, '用户名不能超过30个字符'],
    match: [/^[\w\u4e00-\u9fa5]+$/, '用户名只能包含中文、字母、数字和下划线']
  },
  email: {
    type: String,
    required: [true, '邮箱是必填项'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码至少需要6个字符'],
    select: false  // 默认查询时不返回密码
  },
  avatar: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [300, '个人简介不能超过300个字符'],
    default: ''
  },
  location: {
    type: String,
    maxlength: [100, '所在地不能超过100个字符'],
    default: ''
  },
  website: {
    type: String,
    maxlength: [200, '网站地址不能超过200个字符'],
    default: ''
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  // 添加文件统计信息字段
  fileStats: {
    totalFiles: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'en-US'],
      default: 'zh-CN'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// 虚拟字段：关注者数量
userSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// 虚拟字段：关注数量
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码比较方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 更新最后登录时间
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return this.save();
};

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'preferences.theme': 1 });

const User = model('User', userSchema);

export default User;
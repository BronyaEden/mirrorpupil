import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const fileSchema = new Schema({
  filename: {
    type: String,
    required: [true, '文件名是必填项'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, '原始文件名是必填项'],
    trim: true
  },
  displayName: {
    type: String,
    required: [true, '显示名称是必填项'],
    trim: true,
    maxlength: [255, '显示名称不能超过255个字符']
  },
  description: {
    type: String,
    maxlength: [1000, '文件描述不能超过1000个字符'],
    default: ''
  },
  fileType: {
    type: String,
    required: [true, '文件类型是必填项'],
    enum: ['image', 'video', 'audio', 'document', 'other']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME类型是必填项']
  },
  fileSize: {
    type: Number,
    required: [true, '文件大小是必填项'],
    min: [0, '文件大小不能为负数']
  },
  // 新增：存储文件数据的Buffer字段
  data: {
    type: Buffer,
    required: true
  },
  // 新增：存储缩略图数据的Buffer字段
  thumbnailData: {
    type: Buffer,
    required: false
  },
  // 修改：文件URL现在指向API端点而不是文件系统路径
  fileUrl: {
    type: String,
    required: [true, '文件URL是必填项']
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  uploaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '上传者ID是必填项']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, '标签长度不能超过50个字符']
  }],
  category: {
    type: String,
    maxlength: [100, '分类不能超过100个字符'],
    default: ''
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, '下载次数不能为负数']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, '查看次数不能为负数']
  },
  likeCount: {
    type: Number,
    default: 0,
    min: [0, '点赞数不能为负数']
  },
  likes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // 软删除时间戳
  deletedAt: {
    type: Date,
    default: null
  },
  accessLevel: {
    type: String,
    enum: ['public', 'private', 'friends', 'link'],
    default: 'public'
  },
  shareLink: {
    type: String,
    unique: true,
    sparse: true  // 允许多个null值
  },
  expiresAt: {
    type: Date,
    default: null
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,  // 视频/音频时长（秒）
    codec: String,     // 编码格式
    bitrate: Number,   // 比特率
    fps: Number,       // 帧率（视频）
    sampleRate: Number // 采样率（音频）
  },
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    message: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：文件大小（人类可读格式）
fileSchema.virtual('fileSizeFormatted').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (this.fileSize === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// 虚拟字段：是否被当前用户点赞
fileSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// 增加下载次数
fileSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// 增加查看次数
fileSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// 切换点赞状态
fileSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (existingLike) {
    // 取消点赞
    this.likes = this.likes.filter(like => 
      like.user.toString() !== userId.toString()
    );
    this.likeCount = Math.max(0, this.likeCount - 1);
  } else {
    // 添加点赞
    this.likes.push({ user: userId });
    this.likeCount += 1;
  }
  
  return this.save();
};

// 索引
fileSchema.index({ uploaderId: 1 });
fileSchema.index({ fileType: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ downloadCount: -1 });
fileSchema.index({ likeCount: -1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ displayName: 'text', description: 'text', tags: 'text' });
fileSchema.index({ shareLink: 1 }, { unique: true, sparse: true });

const File = model('File', fileSchema);

export default File;
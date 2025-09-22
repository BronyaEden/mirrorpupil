import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  conversationType: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, '会话标题不能超过100个字符']
  },
  description: {
    type: String,
    maxlength: [500, '会话描述不能超过500个字符'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    muteNotifications: {
      type: Boolean,
      default: false
    }
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：参与者数量
conversationSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// 验证参与者数量
conversationSchema.pre('save', function(next) {
  if (this.conversationType === 'private' && this.participants.length !== 2) {
    return next(new Error('私人会话必须有且仅有2个参与者'));
  }
  if (this.conversationType === 'group' && this.participants.length < 3) {
    return next(new Error('群组会话至少需要3个参与者'));
  }
  next();
});

// 添加参与者
conversationSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.lastActivity = new Date();
  }
  return this.save();
};

// 移除参与者
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(id => 
    id.toString() !== userId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// 更新最后活动时间
conversationSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// 索引
conversationSchema.index({ participants: 1 });
conversationSchema.index({ conversationType: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ isActive: 1 });

const Conversation = model('Conversation', conversationSchema);

export default Conversation;
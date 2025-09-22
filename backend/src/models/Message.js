import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, '会话ID是必填项']
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '发送者ID是必填项']
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'video', 'audio', 'system'],
    default: 'text',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text' || this.messageType === 'system';
    },
    maxlength: [2000, '消息内容不能超过2000个字符']
  },
  fileId: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: function() {
      return ['file', 'image', 'video', 'audio'].includes(this.messageType);
    }
  },
  fileUrl: {
    type: String,
    required: function() {
      return ['file', 'image', 'video', 'audio'].includes(this.messageType);
    }
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number,
    min: [0, '文件大小不能为负数']
  },
  thumbnailUrl: {
    type: String
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    mimeType: String
  },
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true,
      enum: ['👍', '❤️', '😄', '😮', '😢', '😡']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  systemData: {
    type: Schema.Types.Mixed  // 系统消息的额外数据
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：是否已读
messageSchema.virtual('isRead').get(function() {
  return this.readBy && this.readBy.length > 0;
});

// 虚拟字段：已读用户数量
messageSchema.virtual('readCount').get(function() {
  return this.readBy ? this.readBy.length : 0;
});

// 标记消息为已读
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// 添加反应
messageSchema.methods.addReaction = function(userId, emoji) {
  // 移除用户之前的反应
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  
  // 添加新反应
  this.reactions.push({ user: userId, emoji });
  return this.save();
};

// 移除反应
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  return this.save();
};

// 编辑消息
messageSchema.methods.editContent = function(newContent) {
  if (this.messageType !== 'text') {
    throw new Error('Only text messages can be edited');
  }
  
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// 软删除消息
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.content = '此消息已被删除';
  return this.save();
};

// 索引
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });

const Message = model('Message', messageSchema);

export default Message;

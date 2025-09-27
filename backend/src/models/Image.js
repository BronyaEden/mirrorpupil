import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const imageSchema = new Schema({
  data: {
    type: Buffer,
    required: [true, '图片数据是必填项']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME类型是必填项']
  },
  size: {
    type: Number,
    required: [true, '图片大小是必填项']
  },
  filename: {
    type: String
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '上传用户是必填项']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isAvatar: {
    type: Boolean,
    default: false
  },
  isCover: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引
imageSchema.index({ uploadedBy: 1 });
imageSchema.index({ createdAt: -1 });
imageSchema.index({ isAvatar: 1 });
imageSchema.index({ isCover: 1 });

const Image = model('Image', imageSchema);

export default Image;
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 定义用户Schema（简化版，只包含必要的字段）
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    default: null
  }
}, {
  timestamps: true
});

// 创建用户模型
const User = mongoose.model('User', userSchema);

// 数据库连接
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 修复用户avatar字段
const fixUserAvatar = async () => {
  try {
    // 使用原生MongoDB操作直接更新数据
    const result = await User.updateMany(
      { avatar: "" }, 
      { $set: { avatar: null } }
    );
    
    console.log(`修复了 ${result.modifiedCount} 个用户的avatar字段`);
  } catch (error) {
    console.error('修复用户avatar字段时出错:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  
  try {
    await fixUserAvatar();
  } catch (error) {
    console.error('执行过程中出错:', error);
  } finally {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
};

main();
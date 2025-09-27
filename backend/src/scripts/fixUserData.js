import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

// 加载环境变量
dotenv.config();

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

// 修复用户数据
const fixUserData = async () => {
  try {
    // 查找所有用户并检查avatar字段
    const users = await User.find({});
    
    console.log(`找到 ${users.length} 个用户`);
    
    let fixedCount = 0;
    for (const user of users) {
      // 检查avatar字段是否为空字符串
      if (user.avatar === "") {
        console.log(`修复用户: ${user.username} (${user.email})`);
        user.avatar = null; // 将空字符串设置为null
        await user.save();
        console.log(`用户 ${user.username} 修复完成`);
        fixedCount++;
      }
    }
    
    console.log(`所有用户数据修复完成，共修复 ${fixedCount} 个用户`);
  } catch (error) {
    console.error('修复用户数据时出错:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  
  try {
    await fixUserData();
  } catch (error) {
    console.error('执行过程中出错:', error);
  } finally {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
};

main();
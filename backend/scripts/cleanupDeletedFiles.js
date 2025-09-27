import mongoose from 'mongoose';
import { File } from '../src/models/index.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/file-social-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

// 清理超过12小时的软删除文件
const cleanupDeletedFiles = async () => {
  try {
    // 计算12小时前的时间
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    // 查找超过12小时且已被软删除的文件
    const filesToDelete = await File.find({
      isActive: false,
      deletedAt: { $lt: twelveHoursAgo }
    });
    
    if (filesToDelete.length === 0) {
      console.log('没有找到需要彻底删除的文件');
      return { success: true, message: '没有找到需要彻底删除的文件', deletedCount: 0 };
    }
    
    console.log(`找到 ${filesToDelete.length} 个需要彻底删除的文件`);
    
    // 彻底删除这些文件
    const deletePromises = filesToDelete.map(file => {
      console.log(`正在删除文件: ${file.filename} (ID: ${file._id})`);
      return File.findByIdAndDelete(file._id);
    });
    
    await Promise.all(deletePromises);
    
    console.log(`成功删除 ${filesToDelete.length} 个文件`);
    return { success: true, message: `成功删除 ${filesToDelete.length} 个文件`, deletedCount: filesToDelete.length };
  } catch (error) {
    console.error('清理软删除文件时出错:', error);
    return { success: false, message: '清理软删除文件时出错', error: error.message };
  }
};

// 主函数
const main = async () => {
  const isConnected = await connectDB();
  
  if (!isConnected) {
    process.exit(1);
  }
  
  try {
    const result = await cleanupDeletedFiles();
    console.log('定时任务执行结果:', result);
  } catch (error) {
    console.error('执行定时任务时出错:', error);
  } finally {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
};

// 如果直接运行此脚本，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default cleanupDeletedFiles;
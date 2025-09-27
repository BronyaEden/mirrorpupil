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
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

// 清理12小时前软删除的文件
const cleanupDeletedFiles = async () => {
  try {
    // 计算12小时前的时间
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    // 查找12小时前被软删除的文件
    const deletedFiles = await File.find({
      isActive: false,
      deletedAt: { $lt: twelveHoursAgo }
    });
    
    if (deletedFiles.length === 0) {
      console.log('没有需要清理的文件');
      return;
    }
    
    console.log(`找到 ${deletedFiles.length} 个需要清理的文件`);
    
    // 物理删除这些文件
    const result = await File.deleteMany({
      isActive: false,
      deletedAt: { $lt: twelveHoursAgo }
    });
    
    console.log(`成功清理 ${result.deletedCount} 个文件`);
  } catch (error) {
    console.error('清理文件时出错:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await cleanupDeletedFiles();
  await mongoose.connection.close();
  console.log('清理任务完成');
};

// 如果直接运行此脚本，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('执行清理任务时出错:', error);
    process.exit(1);
  });
}

export default cleanupDeletedFiles;
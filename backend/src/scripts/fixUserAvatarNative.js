import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库连接
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('MongoDB连接成功');
    return client;
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 修复用户avatar字段
const fixUserAvatar = async (client) => {
  try {
    const db = client.db('file-social-platform');
    const collection = db.collection('users');
    
    // 查找avatar字段为空字符串的用户
    const users = await collection.find({ avatar: "" }).toArray();
    console.log(`找到 ${users.length} 个avatar字段为空字符串的用户`);
    
    // 修复每个用户的avatar字段
    for (const user of users) {
      console.log(`修复用户: ${user.username} (${user.email})`);
      const result = await collection.updateOne(
        { _id: user._id },
        { $set: { avatar: null } }
      );
      console.log(`用户 ${user.username} 修复完成，修改了 ${result.modifiedCount} 条记录`);
    }
    
    console.log('所有用户数据修复完成');
  } catch (error) {
    console.error('修复用户avatar字段时出错:', error);
  }
};

// 主函数
const main = async () => {
  const client = await connectDB();
  
  try {
    await fixUserAvatar(client);
  } catch (error) {
    console.error('执行过程中出错:', error);
  } finally {
    await client.close();
    console.log('数据库连接已关闭');
  }
};

main();
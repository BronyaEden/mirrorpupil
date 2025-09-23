// 管理员账户初始化脚本
// 在 MongoDB 初始化时创建默认管理员账户

db = db.getSiblingDB('file-social-platform');

// 创建默认管理员账户
const bcrypt = require('bcryptjs');

// 默认管理员信息
const adminData = {
  username: 'admin',
  email: 'admin@filesocial.com',
  password: '$2a$12$YourHashedPasswordHere', // 这里需要替换为实际的bcrypt哈希
  role: 'admin',
  isActive: true,
  isVerified: true,
  avatar: '',
  bio: '系统管理员',
  location: '',
  website: '',
  followers: [],
  following: [],
  preferences: {
    theme: 'auto',
    language: 'zh-CN',
    notifications: {
      email: true,
      push: true
    }
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
  loginCount: 0
};

// 检查是否已存在管理员账户
const existingAdmin = db.users.findOne({ 
  $or: [
    { username: 'admin' },
    { role: 'admin' }
  ]
});

if (!existingAdmin) {
  // 创建管理员账户
  // 注意：实际部署时需要使用安全的密码哈希
  const hashedPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6KjClDnG2y'; // 'admin123'
  
  adminData.password = hashedPassword;
  
  const result = db.users.insertOne(adminData);
  
  if (result.acknowledged) {
    print('✓ 默认管理员账户创建成功');
    print('  用户名: admin');
    print('  密码: admin123');
    print('  角色: admin');
    print('  注意: 请在生产环境中修改默认密码！');
  } else {
    print('✗ 管理员账户创建失败');
  }
} else {
  print('✓ 管理员账户已存在，跳过创建');
}

// 创建索引以优化管理后台查询性能
try {
  // 用户索引
  db.users.createIndex({ "role": 1 });
  db.users.createIndex({ "isActive": 1 });
  db.users.createIndex({ "createdAt": -1 });
  db.users.createIndex({ "lastLoginAt": -1 });
  db.users.createIndex({ "username": "text", "email": "text" });
  
  // 文件索引
  db.files.createIndex({ "uploaderId": 1 });
  db.files.createIndex({ "fileType": 1 });
  db.files.createIndex({ "isPublic": 1 });
  db.files.createIndex({ "createdAt": -1 });
  db.files.createIndex({ "downloadCount": -1 });
  db.files.createIndex({ "viewCount": -1 });
  db.files.createIndex({ "filename": "text", "displayName": "text" });
  
  // 消息索引
  db.messages.createIndex({ "conversationId": 1, "createdAt": -1 });
  db.messages.createIndex({ "senderId": 1 });
  db.messages.createIndex({ "messageType": 1 });
  
  // 会话索引
  db.conversations.createIndex({ "participants": 1 });
  db.conversations.createIndex({ "lastActivity": -1 });
  db.conversations.createIndex({ "conversationType": 1 });
  
  print('✓ 数据库索引创建完成');
} catch (e) {
  print('⚠ 索引创建时出现错误: ' + e.message);
}

print('=== 管理后台初始化完成 ===');
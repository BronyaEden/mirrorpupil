// MongoDB初始化脚本
db = db.getSiblingDB('file-social-platform');

// 创建应用用户
db.createUser({
  user: 'appuser',
  pwd: 'apppassword123',
  roles: [
    {
      role: 'readWrite',
      db: 'file-social-platform'
    }
  ]
});

// 创建集合和索引
db.createCollection('users');
db.createCollection('files');
db.createCollection('conversations');
db.createCollection('messages');

// 用户集合索引
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

// 文件集合索引
db.files.createIndex({ "uploaderId": 1 });
db.files.createIndex({ "fileType": 1 });
db.files.createIndex({ "isPublic": 1 });
db.files.createIndex({ "createdAt": -1 });
db.files.createIndex({ "downloadCount": -1 });
db.files.createIndex({ "likeCount": -1 });
db.files.createIndex({ 
  "displayName": "text", 
  "description": "text", 
  "tags": "text" 
});

// 会话集合索引
db.conversations.createIndex({ "participants": 1 });
db.conversations.createIndex({ "lastActivity": -1 });

// 消息集合索引
db.messages.createIndex({ "conversationId": 1, "createdAt": -1 });
db.messages.createIndex({ "senderId": 1 });

print('MongoDB initialization completed');
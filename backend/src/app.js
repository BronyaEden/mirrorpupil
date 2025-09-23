import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import SocketHandler from './services/socketHandler.js';

// 路由导入
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.io配置
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 初始化Socket处理程序
const socketHandler = new SocketHandler(io);

// 基础中间件
app.use(helmet({
  contentSecurityPolicy: false // 开发环境可以关闭，生产环境建议配置
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP在窗口期内最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});

app.use('/api/', limiter);

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// API路由（待实现）
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '文件管理社交平台 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      files: '/api/files',
      chat: '/api/chat',
      users: '/api/users'
    }
  });
});

// Socket.io连接处理由SocketHandler管理

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: '请求体过大'
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
  });
});

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

// 启动服务器
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`API文档: http://localhost:${PORT}/api`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
  });
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    mongoose.connection.close(false, () => {
      console.log('MongoDB连接已关闭');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    mongoose.connection.close(false, () => {
      console.log('MongoDB连接已关闭');
      process.exit(0);
    });
  });
});

startServer().catch(console.error);

export default app;
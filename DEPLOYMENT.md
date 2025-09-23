# 部署指南

## 快速开始

### 环境要求

- Docker 20.0+
- Docker Compose 2.0+
- Node.js 18+ (本地开发)
- MongoDB 5.0+ (本地开发)
- Redis 6.0+ (本地开发)

### 使用Docker部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd file-social-platform
```

2. **环境配置**
```bash
# 复制环境变量文件
cp backend/.env.example backend/.env

# 编辑环境变量（重要：修改默认密码和密钥）
nano backend/.env
```

3. **启动所有服务**
```bash
# 生产环境
docker-compose up -d

# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:5000/api
- 管理后台: http://localhost:3000/admin
- 健康检查: http://localhost:5000/api/health

### 本地开发部署

1. **启动数据库服务**
```bash
# 仅启动数据库
docker-compose up -d mongodb redis
```

2. **后端开发**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

3. **前端开发**
```bash
cd frontend
npm install
npm run dev
```

## 生产环境配置

### 环境变量配置

**后端环境变量 (.env)**
```env
NODE_ENV=production
PORT=5000

# 数据库配置（请修改默认密码）
MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/file-social-platform?authSource=admin
REDIS_URL=redis://:your-redis-password@redis:6379

# JWT配置（请生成安全的密钥）
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-key-here
JWT_REFRESH_EXPIRE=7d

# 管理员认证配置
ADMIN_JWT_SECRET=your-admin-secret-key-here
ADMIN_JWT_EXPIRE=24h

# 文件上传配置
MAX_FILE_SIZE=2147483648
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,audio/mp3,audio/wav,application/pdf
UPLOAD_PATH=./uploads

# CORS配置
CORS_ORIGIN=https://your-domain.com

# 安全配置
BCRYPT_ROUNDS=12

# 邮件配置（可选）
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### SSL/HTTPS配置

1. **获取SSL证书**
```bash
# 使用Let's Encrypt
certbot certonly --webroot -w ./nginx/www -d your-domain.com
```

2. **配置Nginx**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 其他配置...
}
```

### 性能优化

1. **数据库优化**
```javascript
// MongoDB连接池配置
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};
```

2. **Redis缓存配置**
```bash
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

3. **Nginx优化**
```nginx
# 启用压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 缓存配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 监控和维护

### 日志管理

1. **查看容器日志**
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

2. **日志轮转**
```bash
# 在docker-compose.yml中配置
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 备份策略

1. **数据库备份**
```bash
# 自动备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec file-social-mongodb mongodump --out /backup/mongodb_$DATE
```

2. **文件备份**
```bash
# 备份上传的文件
tar -czf uploads_backup_$DATE.tar.gz ./backend/uploads/
```

### 健康检查和监控

1. **使用Docker健康检查**
```yaml
healthcheck:
  test: ["CMD", "node", "healthcheck.js"]
  interval: 30s
  timeout: 10s
  retries: 3
```

2. **监控指标**
- CPU使用率
- 内存使用率
- 磁盘空间
- 数据库连接数
- API响应时间

## 故障排除

### 常见问题

1. **数据库连接失败**
```bash
# 检查MongoDB容器状态
docker-compose ps mongodb

# 查看MongoDB日志
docker-compose logs mongodb
```

2. **文件上传失败**
```bash
# 检查uploads目录权限
ls -la backend/uploads/

# 检查磁盘空间
df -h
```

3. **前端构建失败**
```bash
# 清除缓存重新安装
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 性能问题诊断

1. **数据库性能**
```javascript
// 在MongoDB中启用慢查询日志
db.setProfilingLevel(2, { slowms: 100 })
```

2. **内存泄漏检查**
```bash
# 监控Node.js内存使用
docker stats file-social-backend
```

## 安全加固

### 服务器安全

1. **防火墙配置**
```bash
# 只开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

2. **定期更新**
```bash
# 更新系统包
apt update && apt upgrade -y

# 更新Docker镜像
docker-compose pull
docker-compose up -d
```

### 应用安全

1. **依赖安全扫描**
```bash
# 检查npm包漏洞
npm audit

# 自动修复
npm audit fix
```

2. **代码安全扫描**
```bash
# 使用ESLint安全规则
npm install --save-dev eslint-plugin-security
```

## 扩展和升级

### 水平扩展

1. **使用Docker Swarm**
```bash
# 初始化集群
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.yml fileplatform
```

2. **使用Kubernetes**
```yaml
# 创建Kubernetes部署配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: file-social-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: file-social-backend:latest
        ports:
        - containerPort: 5000
```

### 版本升级

1. **滚动更新**
```bash
# 构建新版本
docker-compose build

# 滚动更新
docker-compose up -d --no-deps backend
```

2. **数据库迁移**
```javascript
// 创建迁移脚本
const migration = {
  version: '2.0.0',
  up: async () => {
    // 升级逻辑
  },
  down: async () => {
    // 回滚逻辑
  }
};
```

## 管理后台配置

### 管理员账户

默认管理员账户:
- 用户名: admin
- 密码: admin123

**重要**: 部署后请立即修改默认管理员密码。

### 管理后台功能

管理后台包含以下功能模块:
1. 仪表板 - 系统概览和关键指标
2. 用户管理 - 用户列表和权限管理
3. 文件管理 - 文件浏览和管理
4. 消息管理 - 系统消息和通知
5. 数据分析 - 用户和文件统计
6. 系统监控 - 系统状态和性能监控
7. 安全管理 - 安全设置和日志
8. 系统设置 - 系统配置和参数

## 支持和联系

如有问题或需要支持，请：

1. 查看文档和FAQ
2. 提交Issue到GitHub仓库
3. 联系技术支持团队

---

**注意**: 生产环境部署前，请务必：
- 修改所有默认密码
- 生成安全的JWT密钥
- 配置SSL证书
- 设置合适的CORS策略
- 启用日志记录和监控
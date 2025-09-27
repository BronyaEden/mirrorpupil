# 部署指南

## 快速开始

### 环境要求

- Docker 20.0+ (推荐用于数据库服务)
- Docker Compose 2.0+ (推荐用于数据库服务)
- Node.js 18+ (必需)
- MongoDB 5.0+ (本地安装或通过Docker)
- Redis 6.0+ (本地安装或通过Docker)

### 使用Docker部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd file-social-platform
```

2. **环境配置**
```bash
# 复制后端环境变量文件
cp backend/.env.example backend/.env

# 复制前端环境变量文件
cp frontend/.env.example frontend/.env

# 编辑环境变量（重要：修改默认密码和密钥）
nano backend/.env
nano frontend/.env
```

3. **启动所有服务**
```bash
# 生产环境
docker-compose up -d

# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Windows用户可以使用我们提供的脚本
docker-dev.bat
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:5000/api
- 管理后台: http://localhost:3000/admin
- 健康检查: http://localhost:5000/api/health

### 本地开发部署（不使用Docker）

如果您选择不在Docker中运行数据库服务，则需要在本地安装MongoDB和Redis。

#### 安装MongoDB

1. 访问 MongoDB 官方下载页面: https://www.mongodb.com/try/download/community
2. 选择以下选项：
   - Version: 最新稳定版本
   - Platform: Windows x64
   - Package: msi
3. 点击 "Download" 下载安装文件
4. 双击下载的 `.msi` 文件开始安装，按默认选项完成安装

#### 安装Redis

1. 访问 https://github.com/microsoftarchive/redis/releases
2. 下载最新的 `Redis-x64-*.msi` 文件
3. 双击下载的 `.msi` 文件开始安装，按默认选项完成安装

#### 启动数据库服务

```bash
# 启动MongoDB服务（Windows服务方式）
net start MongoDB

# 启动Redis服务（如果安装为服务）
net start Redis

# 或者直接运行Redis服务器
redis-server
```

#### 后端开发

```bash
cd backend
npm install
# 确保 .env 文件配置正确，指向本地数据库
npm run dev
```

#### 前端开发

```bash
cd frontend
npm install
# 复制前端环境变量文件（如果不存在）
cp .env.example .env
npm run dev
```

## 使用工具脚本

为了简化开发流程，我们提供了几个实用的脚本：

### Windows用户

1. **设置开发环境**
```cmd
setup-dev-environment.bat
```
这个脚本会自动安装前后端的所有依赖。

2. **启动开发服务器**
```cmd
start-dev.bat
```
这个脚本会同时启动前后端开发服务器。

3. **Docker开发环境**
```cmd
docker-dev.bat
```
这个脚本会使用Docker启动所有服务。

4. **健康检查**
```cmd
npm run health
```
或者直接运行：
```cmd
node health-check.js
```
这个脚本会检查所有服务是否正常运行。

## 生产环境配置

### 环境变量配置

#### 后端环境变量配置 (backend/.env)

生产环境中，必须修改以下关键配置项。在部署到服务器之前，请确保创建 `backend/.env` 文件并根据实际情况进行配置：

```env
# 环境配置
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

# 云存储配置（可选，用于将文件存储到云服务）
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-west-2
# AWS_S3_BUCKET=your-s3-bucket-name

# CORS配置（替换为你的域名）
CORS_ORIGIN=https://your-domain.com

# 安全配置
BCRYPT_ROUNDS=12

# 邮件配置（可选）
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 前端环境变量配置 (frontend/.env)

前端环境变量文件应该包含以下配置。在部署到服务器之前，请确保创建 `frontend/.env` 文件并根据实际情况进行配置：

```env
# API后端地址（生产环境需要修改为实际域名）
VITE_API_URL=https://your-domain.com/api
VITE_BACKEND_URL=https://your-domain.com
```

### Docker Compose配置

#### 生产环境配置

在生产环境中，docker-compose.yml文件中的敏感信息需要被修改。同时建议为容器设置资源限制以防止资源耗尽：

```yaml
services:
  backend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
  
  frontend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'
        reservations:
          memory: 256M
          cpus: '0.1'
```

在生产环境中，docker-compose.yml文件中的敏感信息需要被修改：

```yaml
services:
  mongodb:
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your-secure-mongodb-password  # 修改此密码
      MONGO_INITDB_DATABASE: file-social-platform
    
  redis:
    command: redis-server --appendonly yes --requirepass your-secure-redis-password  # 修改此密码
    
  backend:
    environment:
      NODE_ENV: production
      # 数据库配置（与mongodb和redis服务中的密码保持一致）
      MONGODB_URI: mongodb://admin:your-secure-mongodb-password@mongodb:27017/file-social-platform?authSource=admin
      REDIS_URL: redis://:your-secure-redis-password@redis:6379
      # JWT配置（必须修改为安全的密钥）
      JWT_SECRET: your-secure-jwt-secret-key-here
      JWT_REFRESH_SECRET: your-secure-refresh-secret-key-here
      # CORS配置（修改为你的域名）
      CORS_ORIGIN: https://your-domain.com
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

3. **Nginx反向代理配置**

前端和后端服务可以通过Nginx进行反向代理配置，实现统一入口访问：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 后端API接口
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # WebSocket支持（用于实时聊天）
    location /socket.io/ {
        proxy_pass http://backend:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
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

3. **集中日志管理**

在生产环境中，建议使用集中式日志管理系统，如ELK Stack（Elasticsearch, Logstash, Kibana）或Fluentd + Elasticsearch：

```yaml
# docker-compose.yml中添加日志服务
services:
  elasticsearch:
    image: elasticsearch:7.17.0
    # 配置...
  
  kibana:
    image: kibana:7.17.0
    # 配置...
  
  logstash:
    image: logstash:7.17.0
    # 配置...
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

3. **自动化备份**

建议设置定时任务来自动执行备份：

```bash
# 添加到crontab中
0 2 * * * /path/to/backup-script.sh  # 每天凌晨2点执行备份
```

4. **备份存储**

生产环境中建议将备份存储到不同的位置，如云存储服务：

```bash
# 上传到AWS S3
aws s3 cp uploads_backup_$DATE.tar.gz s3://your-backup-bucket/

# 或上传到其他云存储
# 根据具体云服务商的CLI工具进行操作
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

3. **应用性能监控**

可以集成APM工具如New Relic、Datadog等来监控应用性能：

```javascript
// 在app.js中添加APM初始化代码
const newrelic = require('newrelic');

// 或使用Prometheus监控
const prometheus = require('prom-client');
```

4. **告警机制**

设置告警规则以在系统异常时及时通知：

```yaml
# 示例告警规则
rules:
  - alert: HighCPUUsage
    expr: cpu_usage > 80%
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage has been above 80% for more than 5 minutes"
```

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

## 灾难恢复

### 数据恢复

如果发生数据丢失或损坏，可以使用备份进行恢复：

```bash
# 恢复MongoDB数据
docker exec file-social-mongodb mongorestore /backup/mongodb_YYYYMMDD_HHMMSS

# 恢复上传文件
tar -xzf uploads_backup_YYYYMMDD_HHMMSS.tar.gz -C ./backend/
```

### 服务恢复

如果服务完全不可用，可以重新部署：

```bash
# 停止并删除现有容器
docker-compose down

# 重新构建并启动服务
docker-compose up -d --build

# 验证服务状态
docker-compose ps
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

3. **网络安全**

在生产环境中，建议启用额外的安全措施：

```yaml
# 在docker-compose.yml中添加网络安全配置
services:
  backend:
    # ... 其他配置
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
```

4. **API安全**

启用速率限制和安全头：

```javascript
// 在后端应用中添加安全中间件
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
}));
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

3. **蓝绿部署**

对于零停机时间部署，可以使用蓝绿部署策略：

```bash
# 启动新版本服务
docker-compose -f docker-compose.yml -f docker-compose.green.yml up -d

# 切换流量到新版本
# 通过负载均衡器或DNS切换

# 关闭旧版本服务
docker-compose -f docker-compose.yml -f docker-compose.blue.yml down
```

4. **回滚策略**

如果新版本出现问题，可以快速回滚到之前的版本：

```bash
# 回滚到之前的版本
docker-compose down
docker-compose up -d
```

## 部署后必要步骤

### 管理员账户设置

默认管理员账户:
- 用户名: admin
- 密码: admin123

**重要**: 部署后请立即修改默认管理员密码。

### 数据库初始化

系统会自动执行数据库初始化脚本，创建必要的集合和索引。如果需要手动初始化，请运行：

```bash
docker exec -it file-social-mongodb mongo file-social-platform /app/scripts/init-mongo.js
```

### 文件权限设置

确保上传目录具有正确的权限：

```bash
# 在容器中设置权限
docker exec file-social-backend chown -R node:nodejs /app/uploads

# 或在宿主机上设置权限
chmod -R 755 backend/uploads/
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
- 配置适当的备份策略
- 设置监控和告警机制
- 测试所有功能模块
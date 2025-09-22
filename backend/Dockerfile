# 后端Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装系统依赖（用于Sharp等包）
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads logs

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S node -u 1001

# 修改目录权限
RUN chown -R node:nodejs /app
USER node

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["npm", "start"]
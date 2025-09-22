# 测试指南

## 测试策略

本项目采用多层次的测试策略，确保代码质量和功能稳定性。

### 测试层次

1. **单元测试** - 测试单个组件和函数
2. **集成测试** - 测试组件间的交互
3. **端到端测试** - 测试完整的用户流程
4. **性能测试** - 测试应用性能指标

## 前端测试

### 技术栈
- **Jest** - 测试框架
- **React Testing Library** - React组件测试
- **@testing-library/jest-dom** - DOM断言扩展
- **@testing-library/user-event** - 用户交互模拟

### 运行测试

```bash
# 运行所有测试
npm test

# 监视模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 测试文件结构

```
src/
├── __tests__/          # 测试文件目录
│   ├── AuthPage.test.tsx
│   ├── FileCard.test.tsx
│   └── ...
├── components/
├── pages/
└── ...
```

### 测试示例

#### 组件测试
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import FileCard from '../components/FileCard';
import { theme } from '../styles/theme';

test('应该渲染文件基本信息', () => {
  const mockFile = {
    // 模拟数据
  };
  
  render(
    <ThemeProvider theme={theme}>
      <FileCard file={mockFile} />
    </ThemeProvider>
  );
  
  expect(screen.getByText('文件名')).toBeInTheDocument();
});
```

#### Redux测试
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser } from '../store/authSlice';

test('应该处理登录成功', () => {
  const store = configureStore({
    reducer: { auth: authReducer }
  });
  
  // 测试action
  store.dispatch(loginUser.fulfilled(mockUser, '', mockCredentials));
  
  const state = store.getState();
  expect(state.auth.isAuthenticated).toBe(true);
});
```

### 测试覆盖率目标

- **分支覆盖率**: ≥ 70%
- **函数覆盖率**: ≥ 70%
- **行覆盖率**: ≥ 70%
- **语句覆盖率**: ≥ 70%

## 后端测试

### 技术栈
- **Jest** - 测试框架
- **Supertest** - HTTP接口测试
- **MongoDB Memory Server** - 内存数据库测试

### 运行测试

```bash
cd backend

# 运行所有测试
npm test

# 监视模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 测试示例

#### API接口测试
```javascript
import request from 'supertest';
import app from '../src/app.js';

describe('Auth API', () => {
  test('POST /api/auth/register', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.username).toBe('testuser');
  });
});
```

#### 数据库模型测试
```javascript
import User from '../src/models/User.js';

describe('User Model', () => {
  test('应该创建有效用户', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = new User(userData);
    await user.save();
    
    expect(user.username).toBe('testuser');
    expect(user.password).not.toBe('password123'); // 应该被加密
  });
});
```

## 端到端测试

### 使用Cypress

```bash
# 安装Cypress
npm install --save-dev cypress

# 打开Cypress
npx cypress open

# 运行E2E测试
npx cypress run
```

### E2E测试示例

```javascript
// cypress/integration/auth.spec.js
describe('用户认证流程', () => {
  it('应该能够注册和登录', () => {
    cy.visit('/auth');
    
    // 注册
    cy.get('[data-testid=switch-to-register]').click();
    cy.get('[data-testid=username-input]').type('testuser');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=confirm-password-input]').type('password123');
    cy.get('[data-testid=register-button]').click();
    
    // 验证注册成功
    cy.url().should('eq', '/');
    cy.get('[data-testid=user-menu]').should('contain', 'testuser');
  });
});
```

## 性能测试

### 前端性能

#### Lighthouse测试
```bash
# 安装lighthouse
npm install -g lighthouse

# 运行性能测试
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

#### Bundle分析
```bash
# 安装bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# 生成分析报告
npm run build
npx webpack-bundle-analyzer dist/static/js/*.js
```

### 后端性能

#### 使用Artillery进行负载测试
```bash
# 安装artillery
npm install -g artillery

# 运行负载测试
artillery run load-test.yml
```

#### 负载测试配置示例
```yaml
# load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API负载测试"
    requests:
      - get:
          url: "/api/files"
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
```

## 持续集成

### GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm test -- --coverage --watchAll=false
      - name: Upload coverage
        uses: codecov/codecov-action@v1
        
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test -- --coverage
        env:
          MONGODB_URI: mongodb://localhost:27017/test
```

## 测试最佳实践

### 1. 测试命名约定
- 使用描述性的测试名称
- 遵循"应该...当...时"的格式
- 使用中文描述测试场景

### 2. 测试数据管理
- 使用Factory函数创建测试数据
- 为每个测试创建独立的数据
- 测试后清理数据

### 3. Mock和Stub
- 合理使用Mock避免外部依赖
- Mock API调用和第三方服务
- 使用MSW进行API Mock

### 4. 异步测试
- 正确处理异步操作
- 使用waitFor等待DOM更新
- 避免使用setTimeout

### 5. 可访问性测试
- 测试键盘导航
- 验证ARIA属性
- 检查颜色对比度

## 常见问题

### Q: 测试运行缓慢
A: 
- 使用并行测试执行
- 优化测试数据创建
- 考虑使用内存数据库

### Q: 测试不稳定
A:
- 避免依赖外部服务
- 正确处理异步操作
- 使用确定性的测试数据

### Q: 覆盖率不足
A:
- 识别关键业务逻辑
- 编写边界条件测试
- 测试错误处理路径

## 测试报告

测试结果和覆盖率报告会自动生成在以下位置：

- 前端测试报告: `frontend/coverage/lcov-report/index.html`
- 后端测试报告: `backend/coverage/lcov-report/index.html`
- E2E测试报告: `cypress/reports/`

定期查看测试报告，确保测试覆盖率达标并及时修复失败的测试。
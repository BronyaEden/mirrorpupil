import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from 'styled-components';
import AuthPage from '../pages/AuthPage';
import authReducer from '../store/authSlice';
import { theme } from '../styles/theme';

// 创建测试用的store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

// 测试渲染辅助函数
const renderWithProviders = (component: React.ReactElement, { initialState = {} } = {}) => {
  const store = createTestStore(initialState);
  
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('AuthPage', () => {
  beforeEach(() => {
    // 清除localStorage
    localStorage.clear();
  });

  test('应该渲染登录表单', () => {
    renderWithProviders(<AuthPage />);
    
    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  test('应该能够切换到注册模式', () => {
    renderWithProviders(<AuthPage />);
    
    // 点击注册链接
    fireEvent.click(screen.getByText('立即注册'));
    
    // 验证注册表单元素
    expect(screen.getByText('加入我们')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('确认密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
  });

  test('应该验证必填字段', async () => {
    renderWithProviders(<AuthPage />);
    
    // 尝试提交空表单
    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    
    // 等待验证错误消息
    await waitFor(() => {
      expect(screen.getByText('请输入邮箱')).toBeInTheDocument();
      expect(screen.getByText('密码不能为空')).toBeInTheDocument();
    });
  });

  test('应该验证邮箱格式', async () => {
    renderWithProviders(<AuthPage />);
    
    // 输入无效邮箱
    fireEvent.change(screen.getByPlaceholderText('邮箱地址'), {
      target: { value: 'invalid-email' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    
    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });
  });

  test('注册时应该验证密码确认', async () => {
    renderWithProviders(<AuthPage />);
    
    // 切换到注册模式
    fireEvent.click(screen.getByText('立即注册'));
    
    // 填写表单
    fireEvent.change(screen.getByPlaceholderText('用户名'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('邮箱地址'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('密码'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('确认密码'), {
      target: { value: 'differentpassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: '注册' }));
    
    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
    });
  });

  test('应该有返回首页的链接', () => {
    renderWithProviders(<AuthPage />);
    
    const homeLink = screen.getByText('返回首页');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });
});
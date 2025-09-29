import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import { fetchUserProfile, logout } from './store/authSlice';
import { RootState } from './store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FileExplorer from './pages/FileExplorer';
import FileUpload from './pages/FileUpload';
import UserProfile from './pages/UserProfile';
import ChatInterface from './pages/ChatInterface';

import MessagesPage from './pages/MessagesPage';
import AIChatPage from './pages/AIChatPage';  // 添加AI聊天页面导入
import UserSearch from './pages/UserSearch';
import AuthPage from './pages/AuthPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminFiles from './pages/AdminFiles';
import AdminSystem from './pages/AdminSystem';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminMessages from './pages/AdminMessages';
import AdminSecurity from './pages/AdminSecurity';
import AdminSettings from './pages/AdminSettings';
import AdminLayout from './components/AdminLayout';
import GlobalHeader from './components/GlobalHeader';
import GlobalMouseEffects from './components/GlobalMouseEffects';
import AnimatedBackground from './components/AnimatedBackground';
import PageTransition from './components/PageTransition';
import MobileNavbar from './components/MobileNavbar'; // 移动端底部导航栏导入
import MobileTopNavbar from './components/MobileTopNavbar'; // 新增移动端顶部导航栏导入
import { GlobalStyles } from './styles/GlobalStyles';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import FileDetailPage from './pages/FileDetailPage';  // 添加文件详情页面导入
import ReactDOM from 'react-dom';

// 添加调试信息
console.log('App component loaded');

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('accessToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

// 用户状态恢复组件
const UserStateRecovery: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, accessToken: storeAccessToken } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // 从localStorage获取accessToken
    const localAccessToken = localStorage.getItem('accessToken');
    
    // 调试信息
    console.log('UserStateRecovery - Token check:', {
      localAccessToken: !!localAccessToken,
      localAccessTokenValue: localAccessToken ? localAccessToken.substring(0, 20) + '...' : null,
      storeAccessToken: !!storeAccessToken,
      user: !!user,
      isAuthenticated
    });
    
    // 如果localStorage中有accessToken但Redux store中没有用户信息，则获取用户信息
    if (localAccessToken && !user) {
      console.log('UserStateRecovery - Dispatching fetchUserProfile');
      dispatch(fetchUserProfile());
    }
    
    // 如果Redux store中有accessToken但localStorage中没有，则清理Redux store状态
    if (storeAccessToken && !localAccessToken) {
      console.log('UserStateRecovery - Dispatching logout');
      dispatch(logout());
    }
  }, [dispatch, user, storeAccessToken, isAuthenticated]);
  
  return null;
};

// 应用主组件
const AppContent: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // 添加调试信息
  useEffect(() => {
    console.log('AppContent mounted');
  }, []);
  
  const toggleMobileSidebar = () => {
    console.log('toggleMobileSidebar called');
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* 全局固定Header - 直接渲染到body */}
      <GlobalHeader />
      
      {/* 全局鼠标特效 - 直接渲染到body */}
      <GlobalMouseEffects />
      
      {/* 添加调试信息 */}
      {console.log('Rendering MobileTopNavbar')}
      {/* 使用Portal将移动端顶部导航栏渲染到body */}
      {ReactDOM.createPortal(
        <MobileTopNavbar onMenuClick={toggleMobileSidebar} />,
        document.body
      )}
      
      {/* 添加调试信息 */}
      {console.log('Rendering MobileNavbar')}
      {/* 使用Portal将移动端底部导航栏渲染到body */}
      {ReactDOM.createPortal(
        <MobileNavbar />,
        document.body
      )}
      
      <PageTransition>
        <Routes>
          {/* 公开路由 */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* 应用主体 - 不再包含Header */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="files" element={<FileExplorer />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="profile/:userId" element={<UserProfile />} />
            <Route path="profile/:userId/files" element={<UserProfile />} />
            <Route path="files/:fileId" element={<FileDetailPage />} />
            
            {/* 需要认证的路由 */}
            <Route path="upload" element={
              <ProtectedRoute>
                <FileUpload />
              </ProtectedRoute>
            } />
            <Route path="chat" element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } />
            <Route path="chat/:conversationId" element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } />
            {/* 消息路由 */}
            <Route path="messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="ai-chat" element={
              <ProtectedRoute>
                <AIChatPage />
              </ProtectedRoute>
            } />

            <Route path="search" element={
              <ProtectedRoute>
                <UserSearch />
              </ProtectedRoute>
            } />
            
          </Route>
          
          {/* 404重定向 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </PageTransition>
    </>
  );
};

const App: React.FC = () => {
  console.log('App rendering');
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <ThemeProvider theme={theme}>
          <AntdApp>
            <GlobalStyles />
            <AnimatedBackground />
            <UserStateRecovery />
            <Router>
              <AppContent />
            </Router>
          </AntdApp>
        </ThemeProvider>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
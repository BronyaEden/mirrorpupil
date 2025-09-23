import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FileExplorer from './pages/FileExplorer';
import FileUpload from './pages/FileUpload';
import UserProfile from './pages/UserProfile';
import ChatInterface from './pages/ChatInterface';
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
import { GlobalStyles } from './styles/GlobalStyles';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('accessToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <ThemeProvider theme={theme}>
          <AntdApp>
            <GlobalStyles />
            <AnimatedBackground />
            <Router>
              <Routes>
                {/* 管理后台路由 */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <>
                    {/* 全局鼠标特效 - 应用于管理后台 */}
                    <GlobalMouseEffects />
                    <AdminLayout />
                  </>
                }>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="files" element={<AdminFiles />} />
                  <Route path="system" element={<AdminSystem />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="security" element={<AdminSecurity />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                {/* 普通用户路由 */}
                <Route path="/*" element={
                  <>
                    {/* 全局固定Header - 直接渲染到body */}
                    <GlobalHeader />
                    
                    {/* 全局鼠标特效 - 直接渲染到body */}
                    <GlobalMouseEffects />
                    
                    <PageTransition>
                      <Routes>
                        {/* 公开路由 */}
                        <Route path="/auth" element={<AuthPage />} />
                        
                        {/* 应用主体 - 不再包含Header */}
                        <Route path="/" element={<Layout />}>
                          <Route index element={<HomePage />} />
                          <Route path="files" element={<FileExplorer />} />
                          <Route path="profile/:userId" element={<UserProfile />} />
                          
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
                        </Route>
                        
                        {/* 404重定向 */}
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </PageTransition>
                  </>
                } />
              </Routes>
            </Router>
          </AntdApp>
        </ThemeProvider>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
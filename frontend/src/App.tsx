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
              <PageTransition>
                <Routes>
                  {/* 公开路由 */}
                  <Route path="/auth" element={<AuthPage />} />
                  
                  {/* 应用主体 */}
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
            </Router>
          </AntdApp>
        </ThemeProvider>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
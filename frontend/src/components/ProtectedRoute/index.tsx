import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);

  // 检查用户是否已认证
  if (!isAuthenticated || !accessToken) {
    // 如果未认证，重定向到登录页面
    return <Navigate to="/auth" replace />;
  }

  // 如果已认证，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;
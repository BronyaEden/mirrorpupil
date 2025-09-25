import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // 检查是否存在管理员令牌
  const adminToken = localStorage.getItem('adminToken');

  // 如果没有管理员令牌，重定向到管理员登录页面
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  // 如果有管理员令牌，渲染子组件
  return <>{children}</>;
};

export default AdminRoute;
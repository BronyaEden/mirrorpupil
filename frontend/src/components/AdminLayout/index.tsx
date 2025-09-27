import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Button,
  Badge,
  Tooltip,
  Alert
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  SecurityScanOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  TeamOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Header, Sider, Content } = Layout;

// 样式组件
const AdminLayout = styled(Layout)`
  min-height: 100vh;
`;

const AdminSider = styled(Sider)`
  .ant-layout-sider-children {
    background: linear-gradient(180deg, #1a365d 0%, #2d3748 100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .ant-menu {
    background: transparent;
    border: none;
    
    .ant-menu-item {
      margin: 4px 8px;
      border-radius: 8px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      &.ant-menu-item-selected {
        background: rgba(102, 126, 234, 0.2);
        border: 1px solid rgba(102, 126, 234, 0.3);
      }
    }
    
    .ant-menu-submenu {
      .ant-menu-submenu-title {
        margin: 4px 8px;
        border-radius: 8px;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
`;

const AdminHeader = styled(Header)`
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  padding: 16px;
  margin-bottom: 8px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationBadge = styled(Badge)`
  .ant-badge-count {
    background: #ff4d4f;
  }
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(102, 126, 234, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 36px;
  max-width: 160px; // 减小最大宽度以适应导航栏
`;

const UserAvatar = styled(Avatar)`
  border: 2px solid #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 1; // 允许收缩
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1a365d;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2; // 调整行高
`;

const UserRole = styled.div`
  font-size: 10px;
  color: #667eea;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2; // 调整行高
`;

const AdminContent = styled(Content)`
  margin: 24px;
  min-height: calc(100vh - 112px);
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
`;

const StatusIndicator = styled.div`
  padding: 12px 16px;
  background: rgba(82, 196, 26, 0.1);
  border-left: 4px solid #52c41a;
  margin: 16px;
  border-radius: 4px;
`;

// 管理员路由守卫
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');
  
  useEffect(() => {
    console.log('AdminGuard - Checking admin token:', adminToken);
    
    if (!adminToken) {
      console.log('AdminGuard - No admin token found, redirecting to login');
      navigate('/admin/login');
      return;
    }
    
    try {
      // 验证token是否有效
      const payload = JSON.parse(atob(adminToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // 如果token已过期，清除并跳转到登录页
      if (payload.exp && payload.exp < currentTime) {
        console.log('AdminGuard - Admin token expired, redirecting to login');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
      
      console.log('AdminGuard - Admin token is valid');
    } catch (error) {
      // 如果token解析失败，清除并跳转到登录页
      console.log('AdminGuard - Admin token invalid, redirecting to login', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
      return;
    }
  }, [adminToken, navigate]);
  
  if (!adminToken) {
    console.log('AdminGuard - Rendering null because no token');
    return null;
  }
  
  console.log('AdminGuard - Rendering children');
  return <>{children}</>;
};

const AdminLayoutComponent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 获取管理员信息
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // 菜单项配置
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: '/admin/files',
      icon: <FileOutlined />,
      label: '文件管理',
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined />,
      label: '消息管理',
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
    {
      key: '/admin/system',
      icon: <CloudServerOutlined />,
      label: '系统监控',
    },
    {
      key: '/admin/security',
      icon: <SecurityScanOutlined />,
      label: '安全管理',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
    },
    {
      key: 'security',
      icon: <SecurityScanOutlined />,
      label: '安全设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminSider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={250}
          collapsedWidth={80}
        >
          <LogoSection>
            <SecurityScanOutlined style={{ fontSize: '24px', color: '#667eea' }} />
            {!collapsed && (
              <div>
                <div style={{ fontSize: '16px' }}>管理后台</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  Admin Panel
                </div>
              </div>
            )}
          </LogoSection>
          
          {!collapsed && (
            <StatusIndicator>
              <Space>
                <DatabaseOutlined style={{ color: '#52c41a' }} />
                <Typography.Text style={{ color: '#52c41a', fontSize: '12px' }}>
                  系统运行正常
                </Typography.Text>
              </Space>
            </StatusIndicator>
          )}

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ marginTop: 16 }}
          />
        </AdminSider>

        <Layout>
          <AdminHeader>
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 48, height: 48 }}
              />
              <Typography.Title level={4} style={{ margin: 0, color: '#1a365d' }}>
                {menuItems.find(item => item.key === location.pathname)?.label || '管理后台'}
              </Typography.Title>
            </Space>

            <UserSection>
              <Tooltip title="通知">
                <NotificationBadge count={notifications} size="small">
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    style={{ fontSize: '16px' }}
                  />
                </NotificationBadge>
              </Tooltip>

              <Dropdown 
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <UserInfoSection>
                  <UserAvatar 
                    icon={<UserOutlined />} 
                    size={28}
                    src={adminUser.avatar || null}
                  />
                  <UserInfo>
                    <UserName title={adminUser.username || 'Admin'}>
                      {adminUser.username || 'Admin'}
                    </UserName>
                    <UserRole title="系统管理员">
                      系统管理员
                    </UserRole>
                  </UserInfo>
                </UserInfoSection>
              </Dropdown>
            </UserSection>
          </AdminHeader>

          <AdminContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </AdminContent>
        </Layout>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminLayoutComponent;
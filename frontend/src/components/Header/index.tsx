import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
  HomeOutlined,
  FileOutlined,
  UploadOutlined,
  MessageOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)`
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.neutral.gray400};
  padding: 0 ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary.main};
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.3);
`;

const NavMenu = styled(Menu)`
  background: transparent;
  border: none;
  flex: 1;
  max-width: 500px;
  margin: 0 ${props => props.theme.spacing.lg};
  
  .ant-menu-item {
    color: ${props => props.theme.colors.text.secondary};
    
    &:hover {
      color: ${props => props.theme.colors.primary.main};
    }
    
    &.ant-menu-item-selected {
      color: ${props => props.theme.colors.primary.main};
      background: rgba(0, 217, 255, 0.1);
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/files',
      icon: <FileOutlined />,
      label: <Link to="/files">文件浏览</Link>,
    },
    ...(isAuthenticated
      ? [
          {
            key: '/upload',
            icon: <UploadOutlined />,
            label: <Link to="/upload">文件上传</Link>,
          },
          {
            key: '/messages',
            icon: <MessageOutlined />,
            label: <Link to="/messages">消息</Link>,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems = isAuthenticated
    ? [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: <Link to={`/profile/${user?._id}`}>个人主页</Link>,
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: '设置',
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
      ]
    : [];

  return (
    <StyledHeader>
      <Logo>镜瞳OVO</Logo>
      
      <NavMenu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
      
      <UserSection>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ padding: 0 }}>
              <Avatar
                size="small"
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ marginRight: 8 }}
              />
              {user?.username}
            </Button>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate('/auth')}
          >
            登录
          </Button>
        )}
      </UserSection>
    </StyledHeader>
  );
};

export default Header;
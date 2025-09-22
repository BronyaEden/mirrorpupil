import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Avatar, Dropdown, Space, Badge, Input } from 'antd';
import { 
  MenuOutlined, 
  SearchOutlined, 
  BellOutlined, 
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  FolderOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import { useViewport } from '../../hooks/useResponsive';
import { mediaQuery } from '../../styles/responsive';
import { ResponsiveFlex } from '../ResponsiveComponents';

const { Header: AntHeader } = Layout;
const { Search } = Input;

interface HeaderProps {
  onMenuClick?: () => void;
}

const StyledHeader = styled(AntHeader)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  height: 64px;
  line-height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  
  ${mediaQuery.mobile(`
    padding: 0 16px;
    height: 56px;
    line-height: 56px;
  `)}
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  cursor: pointer;
  
  ${mediaQuery.mobile(`
    font-size: 18px;
  `)}
`;

const NavLinks = styled.div`
  display: flex;
  gap: 24px;
  
  ${mediaQuery.mobile(`
    display: none;
  `)}
`;

const NavLink = styled(Link)<{ active?: boolean }>`
  color: ${({ active }) => active ? '#1890ff' : '#666'};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: #1890ff;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
  
  ${mediaQuery.mobile(`
    max-width: 200px;
    margin: 0 16px;
  `)}
  
  ${mediaQuery.xs(`
    display: none;
  `)}
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  ${mediaQuery.mobile(`
    gap: 12px;
  `)}
`;

const MobileMenuButton = styled(Button)`
  display: none;
  
  ${mediaQuery.mobile(`
    display: flex;
    align-items: center;
    justify-content: center;
  `)}
`;

const NotificationButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isMobile, isTablet } = useViewport();
  const [searchVisible, setSearchVisible] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/files?search=${encodeURIComponent(value)}`);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate(`/profile/${user?._id}`)
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true
    }
  ];

  const navItems = [
    {
      key: 'home',
      path: '/',
      label: '首页',
      icon: <HomeOutlined />
    },
    {
      key: 'files',
      path: '/files',
      label: '文件',
      icon: <FolderOutlined />
    },
    {
      key: 'upload',
      path: '/upload',
      label: '上传',
      icon: <CloudUploadOutlined />,
      auth: true
    }
  ];

  return (
    <StyledHeader>
      <ResponsiveFlex
        direction={{ xs: 'row' }}
        justify="space-between"
        align="center"
      >
        {/* 左侧：Logo和菜单 */}
        <ResponsiveFlex align="center" gap="16px">
          {isMobile && (
            <MobileMenuButton
              type="text"
              icon={<MenuOutlined />}
              onClick={onMenuClick}
            />
          )}
          
          <Logo onClick={() => navigate('/')}>
            文件社交平台
          </Logo>
          
          {/* 桌面端导航 */}
          <NavLinks>
            {navItems.map(item => {
              if (item.auth && !isAuthenticated) return null;
              
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  active={location.pathname === item.path}
                >
                  <Space>
                    {!isMobile && item.icon}
                    {item.label}
                  </Space>
                </NavLink>
              );
            })}
          </NavLinks>
        </ResponsiveFlex>

        {/* 中间：搜索框 */}
        {!searchVisible && !isMobile && (
          <SearchContainer>
            <Search
              placeholder="搜索文件..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </SearchContainer>
        )}

        {/* 右侧：用户操作 */}
        <UserActions>
          {/* 移动端搜索按钮 */}
          {isMobile && (
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setSearchVisible(!searchVisible)}
            />
          )}

          {isAuthenticated ? (
            <>
              {/* 通知 */}
              <Badge count={3} size="small">
                <NotificationButton
                  type="text"
                  icon={<BellOutlined />}
                  onClick={() => navigate('/notifications')}
                />
              </Badge>

              {/* 消息 */}
              <Badge count={2} size="small">
                <NotificationButton
                  type="text"
                  icon={<MessageOutlined />}
                  onClick={() => navigate('/chat')}
                />
              </Badge>

              {/* 用户头像和菜单 */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar 
                    src={user?.avatar} 
                    icon={<UserOutlined />}
                    size={isMobile ? 'small' : 'default'}
                  />
                  {!isMobile && (
                    <span style={{ color: '#666' }}>
                      {user?.username}
                    </span>
                  )}
                </Space>
              </Dropdown>
            </>
          ) : (
            <Button type="primary" onClick={() => navigate('/auth')}>
              登录
            </Button>
          )}
        </UserActions>
      </ResponsiveFlex>

      {/* 移动端搜索框 */}
      {searchVisible && isMobile && (
        <div style={{ 
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Search
            placeholder="搜索文件..."
            allowClear
            enterButton="搜索"
            onSearch={(value) => {
              handleSearch(value);
              setSearchVisible(false);
            }}
            onBlur={() => {
              // 延迟关闭，允许点击搜索按钮
              setTimeout(() => setSearchVisible(false), 200);
            }}
            autoFocus
          />
        </div>
      )}
    </StyledHeader>
  );
};

export default Header;
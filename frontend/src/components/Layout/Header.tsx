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
  /* 确保Header始终固定在浏览器顶部 */
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
  width: 100% !important;
  height: 64px;
  padding: 0 24px;
  
  /* 美化样式 */
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(42, 52, 65, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 217, 255, 0.1);
  
  /* 布局 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  ${mediaQuery.mobile(`
    padding: 0 16px;
    height: 56px;
  `)}
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(45deg, #FF0080 0%, #00FFFF 50%, #FFFF00 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
  animation: logo-glow 3s ease-in-out infinite;
  
  @keyframes logo-glow {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
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
  color: ${({ active }) => active ? '#00FFFF' : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 8px 16px;
  border-radius: 8px;
  
  &:hover {
    color: #00FFFF;
    background: rgba(0, 255, 255, 0.1);
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  ${({ active }) => active && `
    background: rgba(0, 255, 255, 0.15);
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
  `}
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
  
  .ant-input-search {
    .ant-input {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 217, 255, 0.3);
      color: #fff;
      border-radius: 8px;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
      
      &:focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: #00FFFF;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      }
    }
    
    .ant-input-group-addon {
      .ant-btn {
        background: linear-gradient(45deg, #00FFFF, #FF0080);
        border: none;
        color: #fff;
        
        &:hover {
          background: linear-gradient(45deg, #FF0080, #00FFFF);
          transform: scale(1.05);
        }
      }
    }
  }
  
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 255, 0.2);
    border-color: #00FFFF;
    color: #00FFFF;
    transform: scale(1.05);
  }
  
  ${mediaQuery.mobile(`
    display: flex;
    align-items: center;
    justify-content: center;
  `)}
`;

const MobileSearchContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.98) 0%, rgba(42, 52, 65, 0.98) 100%);
  backdrop-filter: blur(20px);
  padding: 16px;
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 217, 255, 0.1);
  z-index: 999;
  
  .ant-input-search {
    .ant-input {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 217, 255, 0.3);
      color: #fff;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }
    
    .ant-input-group-addon {
      .ant-btn {
        background: linear-gradient(45deg, #00FFFF, #FF0080);
        border: none;
        color: #fff;
      }
    }
  }
`;

const NotificationButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 255, 0.2);
    border-color: #00FFFF;
    color: #00FFFF;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
  }
  
  .anticon {
    font-size: 16px;
  }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '0 0 auto' }}>
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
        {!isMobile && (
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
                    {item.icon}
                    {item.label}
                  </Space>
                </NavLink>
              );
            })}
          </NavLinks>
        )}
      </div>

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
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = '#00FFFF';
                e.currentTarget.style.color = '#00FFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
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
                <Space 
                  style={{ 
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = '#00FFFF';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Avatar 
                    src={user?.avatar} 
                    icon={<UserOutlined />}
                    size={isMobile ? 'small' : 'default'}
                    style={{
                      border: '2px solid rgba(0, 217, 255, 0.5)',
                      boxShadow: '0 0 10px rgba(0, 217, 255, 0.3)'
                    }}
                  />
                  {!isMobile && (
                    <span style={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500
                    }}>
                      {user?.username}
                    </span>
                  )}
                </Space>
              </Dropdown>
            </>
          ) : (
            <Button 
              type="primary" 
              onClick={() => navigate('/auth')}
              style={{
                background: 'linear-gradient(45deg, #00FFFF, #FF0080)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(0, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(45deg, #FF0080, #00FFFF)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 128, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(45deg, #00FFFF, #FF0080)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 255, 255, 0.3)';
              }}
            >
              登录
            </Button>
          )}
        </UserActions>

      {/* 移动端搜索框 */}
      {searchVisible && isMobile && (
        <MobileSearchContainer>
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
        </MobileSearchContainer>
      )}
    </StyledHeader>
  );
};

export default Header;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../store';
import { 
  HomeOutlined, 
  FileOutlined, 
  UploadOutlined, 
  MessageOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { mediaQuery } from '../../styles/responsive';

const MobileNavbarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(42, 52, 65, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 217, 255, 0.2);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 217, 255, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999999;
  padding: 0 clamp(2px, 0.5vw, 4px);
  
  /* 添加防抖动和固定定位强化 */
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  
  ${mediaQuery.desktop(`
    display: none;
  `)}
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: ${props => props.active ? '#00FFFF' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0 6px;
  
  &:hover {
    color: #00FFFF;
    background: rgba(0, 255, 255, 0.1);
  }
  
  &.active {
    color: #00FFFF;
    background: rgba(0, 255, 255, 0.15);
  }
  
  /* 重置hover状态下的transform，防止按钮位移 */
  &:hover {
    transform: none;
  }
`;

const IconWrapper = styled.div`
  font-size: 18px;
  margin-bottom: 2px;
`;

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  onClick: () => void;
}

const MobileNavItem: React.FC<NavItemProps> = ({ icon, label, path, active, onClick }) => {
  return (
    <NavItem active={active} onClick={onClick} className={active ? 'active' : ''}>
      <IconWrapper>{icon}</IconWrapper>
      <span>{label}</span>
    </NavItem>
  );
};

const MobileNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { icon: <HomeOutlined />, label: '首页', path: '/' },
    { icon: <FileOutlined />, label: '文件', path: '/files' },
    ...(isAuthenticated ? [
      { icon: <UploadOutlined />, label: '上传', path: '/upload' },
      { icon: <MessageOutlined />, label: '消息', path: '/messages' },
    ] : []),
    { icon: <UserOutlined />, label: '我的', path: '/profile' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <MobileNavbarContainer className="mobile-navbar">
      {navItems.map((item) => (
        <MobileNavItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          active={location.pathname === item.path}
          onClick={() => handleNavClick(item.path)}
        />
      ))}
    </MobileNavbarContainer>
  );
};

export default MobileNavbar;
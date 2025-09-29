import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { 
  MenuOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { mediaQuery } from '../../styles/responsive';

const MobileTopNavbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(42, 52, 65, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 217, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999999;
  padding: 0 clamp(8px, 2vw, 16px);
  
  /* 添加防抖动和固定定位强化 */
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  
  ${mediaQuery.desktop(`
    display: none;
  `)}
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(45deg, #FF0080 0%, #00FFFF 50%, #FFFF00 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
  animation: logo-glow 3s ease-in-out infinite;
  
  @keyframes logo-glow {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

const NavButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 100%;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  
  &:hover {
    color: #00FFFF;
    background: rgba(0, 217, 255, 0.1);
  }
  
  .icon {
    font-size: 18px;
    margin-bottom: 4px;
  }
  
  /* 重置hover状态下的transform，防止按钮位移 */
  &:hover {
    transform: none;
  }
`;

const ButtonLabel = styled.span`
  font-size: 12px;
  margin-top: 2px;
`;

interface MobileTopNavbarProps {
  onMenuClick?: () => void;
}

const MobileTopNavbar: React.FC<MobileTopNavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <MobileTopNavbarContainer className="mobile-top-navbar">
      <NavButton onClick={onMenuClick}>
        <MenuOutlined className="icon" />
        <ButtonLabel>菜单</ButtonLabel>
      </NavButton>
      
      <Logo onClick={handleLogoClick}>镜瞳OVO</Logo>
      
      {isAuthenticated ? (
        <NavButton onClick={handleLogout}>
          <LogoutOutlined className="icon" />
          <ButtonLabel>退出</ButtonLabel>
        </NavButton>
      ) : (
        <div style={{ width: 60 }} /> // 占位符，保持布局平衡
      )}
    </MobileTopNavbarContainer>
  );
};

export default MobileTopNavbar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  UserOutlined,
  FileSearchOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { theme } from '../../styles/theme';
import { mediaQuery } from '../../styles/responsive';

const DropdownContainer = styled(motion.div)`
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(42, 52, 65, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-top: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 217, 255, 0.1);
  z-index: 999998;
  padding: 8px 0;
  
  ${mediaQuery.desktop(`
    display: none;
  `)}
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  
  .icon {
    margin-right: 12px;
    font-size: 18px;
  }
  
  &:hover {
    background: linear-gradient(90deg, rgba(0, 217, 255, 0.2) 0%, transparent 100%);
    color: #00FFFF;
    transform: translateX(4px);
  }
`;

interface DropdownMenuProps {
  onClose: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleUserSearchClick = () => {
    onClose();
    navigate('/search');
  };

  const handleFileSearchClick = () => {
    onClose();
    navigate('/files');
  };

  return (
    <DropdownContainer
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MenuItem onClick={handleUserSearchClick}>
        <UserOutlined className="icon" />
        <span>搜索用户</span>
      </MenuItem>
      <MenuItem onClick={handleFileSearchClick}>
        <FileSearchOutlined className="icon" />
        <span>搜索文件</span>
      </MenuItem>
    </DropdownContainer>
  );
};

export default DropdownMenu;
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTouchInteraction } from '../../hooks/useTouchInteraction';
import { mediaQuery } from '../../styles/responsive';

interface TouchFriendlyCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  elevation?: 'low' | 'medium' | 'high';
}

const StyledCard = styled(motion.div)<{
  isPressed: boolean;
  isHovered: boolean;
  disabled?: boolean;
  elevation: 'low' | 'medium' | 'high';
}>`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  /* 触摸优化 */
  ${mediaQuery.touch(`
    min-height: 44px;
  `)}
  
  /* 阴影效果 */
  ${({ elevation }) => {
    switch (elevation) {
      case 'high':
        return `
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 15px 15px rgba(0, 0, 0, 0.2);
        `;
      case 'low':
        return `
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        `;
      case 'medium':
      default:
        return `
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        `;
    }
  }}
  
  /* 悬停效果 */
  ${({ isHovered, disabled }) => !disabled && isHovered && `
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 217, 255, 0.2);
    border-color: rgba(0, 217, 255, 0.4);
  `}
  
  /* 按压效果 */
  ${({ isPressed, disabled }) => !disabled && isPressed && `
    transform: translateY(0) scale(0.98);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  `}
  
  /* 禁用状态 */
  ${({ disabled }) => disabled && `
    opacity: 0.6;
    cursor: not-allowed;
  `}
  
  /* 渐变背景层 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent);
    z-index: -1;
  }
  
  /* 悬停时的光晕效果 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s ease;
    z-index: -1;
  }
  
  ${({ isHovered }) => isHovered && `
    &::after {
      left: 100%;
    }
  `}
`;

const TouchFriendlyCard: React.FC<TouchFriendlyCardProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  style,
  elevation = 'medium'
}) => {
  const { 
    isPressed, 
    isHovered, 
    touchStart, 
    touchEnd, 
    mouseEnter, 
    mouseLeave 
  } = useTouchInteraction();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <StyledCard
      isPressed={isPressed}
      isHovered={isHovered}
      disabled={disabled}
      elevation={elevation}
      className={className}
      style={style}
      onClick={handleClick}
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      onMouseDown={touchStart}
      onMouseUp={touchEnd}
      whileHover={!disabled ? { y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </StyledCard>
  );
};

export default TouchFriendlyCard;
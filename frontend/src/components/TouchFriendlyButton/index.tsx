import React from 'react';
import styled from 'styled-components';
import { useTouchInteraction } from '../../hooks/useTouchInteraction';
import { mediaQuery } from '../../styles/responsive';

interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const StyledButton = styled.button<{
  variant: 'primary' | 'secondary' | 'outline';
  size: 'small' | 'medium' | 'large';
  isPressed: boolean;
  isHovered: boolean;
  disabled?: boolean;
}>`
  /* 基础样式 */
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  
  /* 触摸优化 - 确保最小触摸区域 */
  ${mediaQuery.touch(`
    min-height: 44px;
    min-width: 44px;
    padding: 6px 8px;
  `)}
  
  /* 尺寸变体 */
  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          padding: 8px 12px;
          font-size: 14px;
          ${mediaQuery.touch(`padding: 5px 7px;`)}
        `;
      case 'large':
        return `
          padding: 16px 24px;
          font-size: 18px;
          ${mediaQuery.touch(`padding: 9px 13px;`)}
        `;
      case 'medium':
      default:
        return `
          padding: 12px 20px;
          font-size: 16px;
          ${mediaQuery.touch(`padding: 7px 11px;`)}
        `;
    }
  }}
  
  /* 颜色变体 */
  ${({ variant, isPressed, isHovered, disabled }) => {
    if (disabled) {
      return `
        background: #4b5563;
        color: #9ca3af;
        cursor: not-allowed;
      `;
    }
    
    switch (variant) {
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          
          &:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(0, 217, 255, 0.6);
          }
          
          ${isPressed && `
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0.98);
          `}
        `;
      case 'outline':
        return `
          background: transparent;
          color: #00D9FF;
          border: 2px solid #00D9FF;
          
          &:hover {
            background: rgba(0, 217, 255, 0.1);
          }
          
          ${isPressed && `
            background: rgba(0, 217, 255, 0.2);
            transform: scale(0.98);
          `}
        `;
      case 'primary':
      default:
        return `
          background: linear-gradient(135deg, #00D9FF 0%, #1890FF 50%, #722ED1 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);
          
          &:hover {
            background: linear-gradient(135deg, #33E1FF 0%, #40A9FF 50%, #9254DE 100%);
            box-shadow: 0 6px 20px rgba(0, 217, 255, 0.4);
            transform: translateY(-2px);
          }
          
          ${isPressed && `
            background: linear-gradient(135deg, #00B8E6 0%, #1682D9 50%, #6629C0 100%);
            box-shadow: 0 2px 10px rgba(0, 217, 255, 0.2);
            transform: translateY(0) scale(0.98);
          `}
        `;
    }
  }}
  
  /* 触摸反馈效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  ${({ isPressed }) => isPressed && `
    &::before {
      opacity: 1;
    }
  `}
  
  /* 禁用状态 */
  ${({ disabled }) => disabled && `
    opacity: 0.6;
    pointer-events: none;
  `}
`;

const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className,
  style
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
    <StyledButton
      variant={variant}
      size={size}
      isPressed={isPressed}
      isHovered={isHovered}
      disabled={disabled}
      className={className}
      style={style}
      onClick={handleClick}
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      onMouseDown={touchStart}
      onMouseUp={touchEnd}
    >
      {children}
    </StyledButton>
  );
};

export default TouchFriendlyButton;
import React from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// 旋转动画
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 脉冲动画
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// 波浪动画
const wave = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-15px); }
`;

// 基础加载器容器
const LoaderContainer = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ size = 'medium' }) => {
    switch (size) {
      case 'small':
        return 'width: 20px; height: 20px;';
      case 'large':
        return 'width: 60px; height: 60px;';
      default:
        return 'width: 40px; height: 40px;';
    }
  }}
`;

// 旋转加载器
const SpinnerRing = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  ${({ size = 'medium' }) => {
    const sizes = {
      small: '20px',
      medium: '40px',
      large: '60px'
    };
    const borderWidth = {
      small: '2px',
      medium: '4px',
      large: '6px'
    };
    return `
      width: ${sizes[size]};
      height: ${sizes[size]};
      border: ${borderWidth[size]} solid #f3f3f3;
      border-top: ${borderWidth[size]} solid #1890ff;
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
    `;
  }}
`;

// 点点加载器
const DotsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const Dot = styled.div<{ delay: number; size?: 'small' | 'medium' | 'large' }>`
  ${({ size = 'medium' }) => {
    const sizes = {
      small: '6px',
      medium: '8px',
      large: '12px'
    };
    return `
      width: ${sizes[size]};
      height: ${sizes[size]};
    `;
  }}
  background-color: #1890ff;
  border-radius: 50%;
  animation: ${pulse} 1.4s ease-in-out infinite both;
  animation-delay: ${({ delay }) => delay}s;
`;

// 波浪加载器
const WaveContainer = styled.div`
  display: flex;
  gap: 2px;
  align-items: flex-end;
`;

const WaveBar = styled.div<{ delay: number; size?: 'small' | 'medium' | 'large' }>`
  ${({ size = 'medium' }) => {
    const widths = {
      small: '3px',
      medium: '4px',
      large: '6px'
    };
    const heights = {
      small: '20px',
      medium: '30px',
      large: '40px'
    };
    return `
      width: ${widths[size]};
      height: ${heights[size]};
    `;
  }}
  background-color: #1890ff;
  animation: ${wave} 1.2s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

// 页面全屏加载
const FullPageLoader = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  z-index: 9999;
`;

const LoadingText = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'dots' | 'wave';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  type = 'spinner'
}) => {
  switch (type) {
    case 'dots':
      return (
        <LoaderContainer size={size}>
          <DotsContainer>
            <Dot delay={0} size={size} />
            <Dot delay={0.2} size={size} />
            <Dot delay={0.4} size={size} />
          </DotsContainer>
        </LoaderContainer>
      );
    
    case 'wave':
      return (
        <LoaderContainer size={size}>
          <WaveContainer>
            <WaveBar delay={0} size={size} />
            <WaveBar delay={0.1} size={size} />
            <WaveBar delay={0.2} size={size} />
            <WaveBar delay={0.3} size={size} />
          </WaveContainer>
        </LoaderContainer>
      );
    
    default:
      return (
        <LoaderContainer size={size}>
          <SpinnerRing size={size} />
        </LoaderContainer>
      );
  }
};

interface FullPageLoadingProps {
  isVisible: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'dots' | 'wave';
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  isVisible,
  text = '加载中...',
  size = 'large',
  type = 'spinner'
}) => {
  if (!isVisible) return null;

  return (
    <FullPageLoader
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size={size} type={type} />
      {text && <LoadingText>{text}</LoadingText>}
    </FullPageLoader>
  );
};

// 按钮加载状态
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ButtonContainer = styled(motion.button)<{ disabled?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #1890ff;
  color: white;
  font-weight: 500;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ disabled }) => disabled ? '#1890ff' : '#40a9ff'};
  }
`;

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  onClick,
  disabled,
  className,
  size = 'small'
}) => {
  return (
    <ButtonContainer
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      {loading && <LoadingSpinner size={size} type="spinner" />}
      {children}
    </ButtonContainer>
  );
};

// 骨架屏组件
const SkeletonBase = styled(motion.div)`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${keyframes`
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  `} 1.5s ease-in-out infinite;
  border-radius: 4px;
`;

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  className
}) => (
  <SkeletonBase
    className={className}
    style={{ width, height }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  />
);

// 卡片骨架屏
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{
      padding: '16px',
      border: '1px solid #f0f0f0',
      borderRadius: '8px',
      background: 'white'
    }}
  >
    <Skeleton width="60%" height="24px" />
    <div style={{ marginTop: '12px' }}>
      <Skeleton width="100%" height="16px" />
      <div style={{ marginTop: '8px' }}>
        <Skeleton width="80%" height="16px" />
      </div>
    </div>
    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
      <Skeleton width="60px" height="32px" />
      <Skeleton width="60px" height="32px" />
    </div>
  </motion.div>
);

export default LoadingSpinner;
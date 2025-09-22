import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { mediaQuery, spacing, containerSizes, responsiveStyles } from '../../styles/responsive';
import { useViewport } from '../../hooks/useResponsive';

// 响应式容器
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';
  padding?: boolean;
  center?: boolean;
  className?: string;
}

const Container = styled.div<ResponsiveContainerProps>`
  width: 100%;
  ${({ maxWidth = 'xl' }) => 
    maxWidth !== 'none' && `max-width: ${containerSizes[maxWidth]};`
  }
  ${({ center = true }) => center && 'margin: 0 auto;'}
  ${({ padding = true }) => padding && responsiveStyles.container}
`;

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = true,
  center = true,
  className
}) => (
  <Container 
    maxWidth={maxWidth}
    padding={padding}
    center={center}
    className={className}
  >
    {children}
  </Container>
);

// 响应式网格系统
interface GridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  className?: string;
}

const GridContainer = styled.div<GridProps>`
  display: grid;
  width: 100%;
  
  ${({ columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 } }) => `
    grid-template-columns: repeat(${columns.xs || 1}, 1fr);
    
    ${columns.sm && mediaQuery.minSm(`grid-template-columns: repeat(${columns.sm}, 1fr);`)}
    ${columns.md && mediaQuery.minMd(`grid-template-columns: repeat(${columns.md}, 1fr);`)}
    ${columns.lg && mediaQuery.minLg(`grid-template-columns: repeat(${columns.lg}, 1fr);`)}
    ${columns.xl && mediaQuery.minXl(`grid-template-columns: repeat(${columns.xl}, 1fr);`)}
  `}
  
  ${({ gap = { xs: '16px', sm: '16px', md: '24px', lg: '24px', xl: '32px' } }) => `
    gap: ${gap.xs || '16px'};
    
    ${gap.sm && mediaQuery.minSm(`gap: ${gap.sm};`)}
    ${gap.md && mediaQuery.minMd(`gap: ${gap.md};`)}
    ${gap.lg && mediaQuery.minLg(`gap: ${gap.lg};`)}
    ${gap.xl && mediaQuery.minXl(`gap: ${gap.xl};`)}
  `}
`;

export const ResponsiveGrid: React.FC<GridProps> = ({
  children,
  columns,
  gap,
  className
}) => (
  <GridContainer columns={columns} gap={gap} className={className}>
    {children}
  </GridContainer>
);

// 响应式弹性布局
interface FlexProps {
  children: React.ReactNode;
  direction?: {
    xs?: 'row' | 'column';
    sm?: 'row' | 'column';
    md?: 'row' | 'column';
    lg?: 'row' | 'column';
    xl?: 'row' | 'column';
  };
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  wrap?: boolean;
  gap?: string;
  className?: string;
}

const FlexContainer = styled.div<FlexProps>`
  display: flex;
  ${({ justify = 'flex-start' }) => `justify-content: ${justify};`}
  ${({ align = 'stretch' }) => `align-items: ${align};`}
  ${({ wrap = false }) => wrap && 'flex-wrap: wrap;'}
  ${({ gap }) => gap && `gap: ${gap};`}
  
  ${({ direction = { xs: 'column', md: 'row' } }) => `
    flex-direction: ${direction.xs || 'row'};
    
    ${direction.sm && mediaQuery.minSm(`flex-direction: ${direction.sm};`)}
    ${direction.md && mediaQuery.minMd(`flex-direction: ${direction.md};`)}
    ${direction.lg && mediaQuery.minLg(`flex-direction: ${direction.lg};`)}
    ${direction.xl && mediaQuery.minXl(`flex-direction: ${direction.xl};`)}
  `}
`;

export const ResponsiveFlex: React.FC<FlexProps> = ({
  children,
  direction,
  justify,
  align,
  wrap,
  gap,
  className
}) => (
  <FlexContainer
    direction={direction}
    justify={justify}
    align={align}
    wrap={wrap}
    gap={gap}
    className={className}
  >
    {children}
  </FlexContainer>
);

// 响应式文本
interface ResponsiveTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  size?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  weight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700';
  align?: {
    xs?: 'left' | 'center' | 'right';
    sm?: 'left' | 'center' | 'right';
    md?: 'left' | 'center' | 'right';
    lg?: 'left' | 'center' | 'right';
    xl?: 'left' | 'center' | 'right';
  };
  color?: string;
  className?: string;
}

const TextElement = styled.div<ResponsiveTextProps>`
  ${({ size }) => size && `
    font-size: ${size.xs || '16px'};
    
    ${size.sm && mediaQuery.minSm(`font-size: ${size.sm};`)}
    ${size.md && mediaQuery.minMd(`font-size: ${size.md};`)}
    ${size.lg && mediaQuery.minLg(`font-size: ${size.lg};`)}
    ${size.xl && mediaQuery.minXl(`font-size: ${size.xl};`)}
  `}
  
  ${({ weight }) => weight && `font-weight: ${weight};`}
  ${({ color }) => color && `color: ${color};`}
  
  ${({ align }) => align && `
    text-align: ${align.xs || 'left'};
    
    ${align.sm && mediaQuery.minSm(`text-align: ${align.sm};`)}
    ${align.md && mediaQuery.minMd(`text-align: ${align.md};`)}
    ${align.lg && mediaQuery.minLg(`text-align: ${align.lg};`)}
    ${align.xl && mediaQuery.minXl(`text-align: ${align.xl};`)}
  `}
  
  line-height: 1.5;
`;

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  as = 'p',
  size,
  weight,
  align,
  color,
  className
}) => (
  <TextElement
    as={as}
    size={size}
    weight={weight}
    align={align}
    color={color}
    className={className}
  >
    {children}
  </TextElement>
);

// 移动端侧边栏
interface MobileSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: string;
}

const SidebarOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  
  ${mediaQuery.desktop(`display: none;`)}
`;

const SidebarContent = styled(motion.div)<{ position: 'left' | 'right'; width: string }>`
  position: fixed;
  top: 0;
  ${({ position }) => position}: 0;
  bottom: 0;
  width: ${({ width }) => width};
  max-width: 90vw;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow-y: auto;
  
  ${mediaQuery.desktop(`display: none;`)}
`;

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  children,
  isOpen,
  onClose,
  position = 'left',
  width = '280px'
}) => {
  const { isMobile } = useViewport();

  if (!isMobile || !isOpen) return null;

  return (
    <>
      <SidebarOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <SidebarContent
        position={position}
        width={width}
        initial={{ x: position === 'left' ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: position === 'left' ? '-100%' : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        {children}
      </SidebarContent>
    </>
  );
};

// 响应式间距组件
interface ResponsiveSpacerProps {
  height?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  width?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

const SpacerElement = styled.div<ResponsiveSpacerProps>`
  ${({ height }) => height && `
    height: ${height.xs || '16px'};
    
    ${height.sm && mediaQuery.minSm(`height: ${height.sm};`)}
    ${height.md && mediaQuery.minMd(`height: ${height.md};`)}
    ${height.lg && mediaQuery.minLg(`height: ${height.lg};`)}
    ${height.xl && mediaQuery.minXl(`height: ${height.xl};`)}
  `}
  
  ${({ width }) => width && `
    width: ${width.xs || '16px'};
    
    ${width.sm && mediaQuery.minSm(`width: ${width.sm};`)}
    ${width.md && mediaQuery.minMd(`width: ${width.md};`)}
    ${width.lg && mediaQuery.minLg(`width: ${width.lg};`)}
    ${width.xl && mediaQuery.minXl(`width: ${width.xl};`)}
  `}
`;

export const ResponsiveSpacer: React.FC<ResponsiveSpacerProps> = ({
  height,
  width
}) => (
  <SpacerElement height={height} width={width} />
);

// 自适应图片组件
interface ResponsiveImageProps {
  src: string;
  alt: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: string;
  className?: string;
}

const ImageContainer = styled.div<{ aspectRatio?: string }>`
  position: relative;
  width: 100%;
  ${({ aspectRatio }) => aspectRatio && `aspect-ratio: ${aspectRatio};`}
  overflow: hidden;
  border-radius: 8px;
`;

const ImageElement = styled.img<{ objectFit: string }>`
  width: 100%;
  height: 100%;
  object-fit: ${({ objectFit }) => objectFit};
  display: block;
`;

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  objectFit = 'cover',
  aspectRatio,
  className
}) => (
  <ImageContainer aspectRatio={aspectRatio} className={className}>
    <ImageElement src={src} alt={alt} objectFit={objectFit} />
  </ImageContainer>
);

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveText,
  MobileSidebar,
  ResponsiveSpacer,
  ResponsiveImage,
};
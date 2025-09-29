import { css } from 'styled-components';

// 断点定义
export const breakpoints = {
  xs: '480px',    // 超小屏幕（手机竖屏）
  sm: '768px',    // 小屏幕（手机横屏/平板竖屏）
  md: '1024px',   // 中等屏幕（平板横屏/小型笔记本）
  lg: '1280px',   // 大屏幕（普通笔记本）
  xl: '1920px',   // 超大屏幕（桌面显示器）
};

// 媒体查询工具函数
export const mediaQuery = {
  xs: (styles: string) => css`
    @media (max-width: ${breakpoints.xs}) {
      ${styles}
    }
  `,
  sm: (styles: string) => css`
    @media (max-width: ${breakpoints.sm}) {
      ${styles}
    }
  `,
  md: (styles: string) => css`
    @media (max-width: ${breakpoints.md}) {
      ${styles}
    }
  `,
  lg: (styles: string) => css`
    @media (max-width: ${breakpoints.lg}) {
      ${styles}
    }
  `,
  xl: (styles: string) => css`
    @media (max-width: ${breakpoints.xl}) {
      ${styles}
    }
  `,
  
  // 最小宽度查询
  minXs: (styles: string) => css`
    @media (min-width: ${breakpoints.xs}) {
      ${styles}
    }
  `,
  minSm: (styles: string) => css`
    @media (min-width: ${breakpoints.sm}) {
      ${styles}
    }
  `,
  minMd: (styles: string) => css`
    @media (min-width: ${breakpoints.md}) {
      ${styles}
    }
  `,
  minLg: (styles: string) => css`
    @media (min-width: ${breakpoints.lg}) {
      ${styles}
    }
  `,
  minXl: (styles: string) => css`
    @media (min-width: ${breakpoints.xl}) {
      ${styles}
    }
  `,
  
  // 范围查询
  between: (min: string, max: string) => (styles: string) => css`
    @media (min-width: ${min}) and (max-width: ${max}) {
      ${styles}
    }
  `,
  
  // 特殊设备查询
  mobile: (styles: string) => css`
    @media (max-width: ${breakpoints.sm}) {
      ${styles}
    }
  `,
  tablet: (styles: string) => css`
    @media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md}) {
      ${styles}
    }
  `,
  desktop: (styles: string) => css`
    @media (min-width: ${breakpoints.md}) {
      ${styles}
    }
  `,
  
  // 横竖屏查询
  landscape: (styles: string) => css`
    @media (orientation: landscape) {
      ${styles}
    }
  `,
  portrait: (styles: string) => css`
    @media (orientation: portrait) {
      ${styles}
    }
  `,
  
  // 高DPI设备查询
  retina: (styles: string) => css`
    @media (-webkit-min-device-pixel-ratio: 2),
           (min-resolution: 192dpi),
           (min-resolution: 2dppx) {
      ${styles}
    }
  `,
  
  // 触摸设备查询
  touch: (styles: string) => css`
    @media (hover: none) and (pointer: coarse) {
      ${styles}
    }
  `,
  
  // 非触摸设备查询
  hover: (styles: string) => css`
    @media (hover: hover) and (pointer: fine) {
      ${styles}
    }
  `,
};

// 容器宽度工具
export const containerSizes = {
  xs: '100%',
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  xxl: '1320px',
};

// 间距系统（响应式）
export const spacing = {
  xs: {
    padding: '4px',
    margin: '4px',
    gap: '4px',
  },
  sm: {
    padding: '6px',
    margin: '6px',
    gap: '6px',
  },
  md: {
    padding: '8px',
    margin: '8px',
    gap: '8px',
  },
  lg: {
    padding: '12px',
    margin: '12px',
    gap: '12px',
  },
  xl: {
    padding: '16px',
    margin: '16px',
    gap: '16px',
  },
};

// 字体大小系统（响应式）
export const typography = {
  fontSize: {
    xs: {
      h1: '24px',
      h2: '20px',
      h3: '18px',
      h4: '16px',
      body: '14px',
      small: '12px',
    },
    sm: {
      h1: '28px',
      h2: '24px',
      h3: '20px',
      h4: '18px',
      body: '14px',
      small: '12px',
    },
    md: {
      h1: '32px',
      h2: '28px',
      h3: '24px',
      h4: '20px',
      body: '16px',
      small: '14px',
    },
    lg: {
      h1: '36px',
      h2: '32px',
      h3: '28px',
      h4: '24px',
      body: '16px',
      small: '14px',
    },
    xl: {
      h1: '40px',
      h2: '36px',
      h3: '32px',
      h4: '28px',
      body: '18px',
      small: '16px',
    },
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.8',
  },
};

// 网格系统
export const grid = {
  columns: 12,
  gutter: {
    xs: '8px',
    sm: '8px',
    md: '12px',
    lg: '12px',
    xl: '16px',
  },
};

// 响应式工具类生成器
export const responsiveValue = (
  values: {
    xs?: string | number;
    sm?: string | number;
    md?: string | number;
    lg?: string | number;
    xl?: string | number;
  },
  property: string
) => css`
  ${values.xs && `${property}: ${values.xs};`}
  
  ${values.sm && mediaQuery.minSm(`${property}: ${values.sm};`)}
  ${values.md && mediaQuery.minMd(`${property}: ${values.md};`)}
  ${values.lg && mediaQuery.minLg(`${property}: ${values.lg};`)}
  ${values.xl && mediaQuery.minXl(`${property}: ${values.xl};`)}
`;

// 常用响应式组件样式
export const responsiveStyles = {
  // 容器样式
  container: css`
    width: 100%;
    max-width: ${containerSizes.xl};
    margin: 0 auto;
    padding: 0 clamp(6px, 1vw, 16px);
    
    ${mediaQuery.sm(`padding: 0 clamp(4px, 1.5vw, 12px);`)}
    ${mediaQuery.lg(`padding: 0 clamp(8px, 1vw, 20px);`)}
  `,
  
  // 弹性布局
  flexCenter: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  
  // 隐藏/显示工具
  hideOnMobile: css`
    ${mediaQuery.mobile(`display: none;`)}
  `,
  
  hideOnDesktop: css`
    ${mediaQuery.desktop(`display: none;`)}
  `,
  
  showOnlyMobile: css`
    display: block;
    ${mediaQuery.desktop(`display: none;`)}
  `,
  
  showOnlyDesktop: css`
    display: none;
    ${mediaQuery.desktop(`display: block;`)}
  `,
  
  // 文本对齐
  textCenter: css`
    text-align: center;
  `,
  
  textLeft: css`
    text-align: left;
    ${mediaQuery.mobile(`text-align: center;`)}
  `,
  
  // 触摸优化
  touchOptimized: css`
    ${mediaQuery.touch(`
      min-height: 44px;
      min-width: 44px;
      padding: 12px;
    `)}
  `,
};

// React Hook for responsive values
export const useResponsiveValue = () => {
  const getResponsiveValue = (values: {
    xs?: any;
    sm?: any;
    md?: any;
    lg?: any;
    xl?: any;
  }) => {
    // 这里可以根据当前窗口大小返回对应的值
    // 在实际使用中可以结合 useMediaQuery hook
    const width = window.innerWidth;
    
    if (width < parseInt(breakpoints.xs)) return values.xs || values.sm || values.md || values.lg || values.xl;
    if (width < parseInt(breakpoints.sm)) return values.sm || values.xs || values.md || values.lg || values.xl;
    if (width < parseInt(breakpoints.md)) return values.md || values.sm || values.xs || values.lg || values.xl;
    if (width < parseInt(breakpoints.lg)) return values.lg || values.md || values.sm || values.xs || values.xl;
    return values.xl || values.lg || values.md || values.sm || values.xs;
  };
  
  return { getResponsiveValue };
};

export default {
  breakpoints,
  mediaQuery,
  containerSizes,
  spacing,
  typography,
  grid,
  responsiveValue,
  responsiveStyles,
  useResponsiveValue,
};
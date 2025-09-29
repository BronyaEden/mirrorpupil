import { css } from 'styled-components';
import { mediaQuery } from './responsive';

// 移动端特定样式工具
export const mobileStyles = {
  // 输入框优化
  inputOptimized: css`
    ${mediaQuery.mobile(`
      font-size: 16px; /* 防止iOS缩放 */
      -webkit-appearance: none;
      border-radius: 8px;
      padding: 12px 16px;
    `)}
  `,
  
  // 按钮优化
  buttonOptimized: css`
    ${mediaQuery.mobile(`
      min-height: 44px;
      min-width: 44px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      -webkit-tap-highlight-color: transparent;
    `)}
  `,
  
  // 卡片优化
  cardOptimized: css`
    ${mediaQuery.mobile(`
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `)}
  `,
  
  // 导航优化
  navOptimized: css`
    ${mediaQuery.mobile(`
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(26, 35, 50, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 217, 255, 0.2);
    `)}
  `,
  
  // 列表优化
  listOptimized: css`
    ${mediaQuery.mobile(`
      padding: 0;
      margin: 0;
    `)}
  `,
  
  // 列表项优化
  listItemOptimized: css`
    ${mediaQuery.mobile(`
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      &:last-child {
        border-bottom: none;
      }
    `)}
  `,
  
  // 模态框优化
  modalOptimized: css`
    ${mediaQuery.mobile(`
      margin: 16px;
      border-radius: 16px;
      
      .ant-modal-content {
        border-radius: 16px;
      }
    `)}
  `,
  
  // 表单优化
  formOptimized: css`
    ${mediaQuery.mobile(`
      padding: 16px;
      
      .ant-form-item {
        margin-bottom: 16px;
      }
      
      .ant-form-item-label {
        padding-bottom: 8px;
      }
    `)}
  `,
  
  // 表单控件优化
  formControlOptimized: css`
    ${mediaQuery.mobile(`
      height: 44px;
      font-size: 16px;
      
      &.ant-input,
      &.ant-select-selector,
      &.ant-picker {
        border-radius: 8px;
        padding: 8px 12px;
      }
    `)}
  `,
  
  // 图片优化
  imageOptimized: css`
    ${mediaQuery.mobile(`
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    `)}
  `,
  
  // 文本优化
  textOptimized: css`
    ${mediaQuery.mobile(`
      line-height: 1.6;
      
      &.ant-typography {
        font-size: 16px;
      }
      
      &.ant-typography.h1 {
        font-size: 28px;
      }
      
      &.ant-typography.h2 {
        font-size: 24px;
      }
      
      &.ant-typography.h3 {
        font-size: 20px;
      }
      
      &.ant-typography.h4 {
        font-size: 18px;
      }
    `)}
  `,
  
  // 滚动区域优化
  scrollAreaOptimized: css`
    ${mediaQuery.mobile(`
      -webkit-overflow-scrolling: touch;
      
      &::-webkit-scrollbar {
        display: none;
      }
    `)}
  `,
  
  // 触摸反馈优化
  touchFeedback: css`
    ${mediaQuery.touch(`
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      
      &:active {
        opacity: 0.8;
      }
    `)}
  `,
  
  // 键盘优化
  keyboardOptimized: css`
    ${mediaQuery.mobile(`
      &.ant-input,
      &.ant-textarea {
        -webkit-autocapitalize: none;
        autocapitalize: none;
        -webkit-autocorrect: off;
        autocorrect: off;
        -webkit-spellcheck: false;
        spellcheck: false;
      }
    `)}
  `,
};

// 移动端安全区域适配
export const safeArea = {
  top: css`
    ${mediaQuery.mobile(`
      padding-top: env(safe-area-inset-top);
    `)}
  `,
  
  bottom: css`
    ${mediaQuery.mobile(`
      padding-bottom: env(safe-area-inset-bottom);
    `)}
  `,
  
  left: css`
    ${mediaQuery.mobile(`
      padding-left: env(safe-area-inset-left);
    `)}
  `,
  
  right: css`
    ${mediaQuery.mobile(`
      padding-right: env(safe-area-inset-right);
    `)}
  `,
  
  all: css`
    ${mediaQuery.mobile(`
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    `)}
  `,
};

// 移动端手势支持
export const gestureSupport = {
  // 防止默认手势
  preventDefault: css`
    ${mediaQuery.touch(`
      touch-action: manipulation;
    `)}
  `,
  
  // 滚动容器
  scrollContainer: css`
    ${mediaQuery.touch(`
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    `)}
  `,
  
  // 滑动区域
  swipeArea: css`
    ${mediaQuery.touch(`
      touch-action: pan-x pan-y;
    `)}
  `,
};

export default {
  mobileStyles,
  safeArea,
  gestureSupport,
};
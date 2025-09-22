import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: linear-gradient(135deg, #0B1426 0%, #1A2332 25%, #2A3441 50%, #1E3A8A 75%, #1A2332 100%);
    background-attachment: fixed;
    color: ${props => props.theme.colors.text.primary};
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(152, 251, 152, 0.05) 0%, transparent 50%);
      z-index: -1;
      pointer-events: none;
    }
  }

  #root {
    min-height: 100vh;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary.main};
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.primary.light};
  }

  /* 选中文本样式 */
  ::selection {
    background: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.text.primary};
  }

  ::-moz-selection {
    background: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.text.primary};
  }

  /* 链接样式 */
  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.theme.colors.primary.light};
    }
  }

  /* 输入框样式 */
  input, textarea {
    font-family: inherit;
  }

  /* 按钮样式重置 */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
  }

  /* 图片样式 */
  img {
    max-width: 100%;
    display: block;
  }

  /* 表格样式 */
  table {
    border-collapse: collapse;
    width: 100%;
  }

  /* 列表样式 */
  ul, ol {
    list-style: none;
  }

  /* 动画关键帧 */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideLeft {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideRight {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -30px, 0);
    }
    70% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  /* 响应式设计 */
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    html {
      font-size: 14px;
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    body {
      font-size: 0.9rem;
    }
  }

  /* 无障碍访问 */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* 暗色模式支持 */
  @media (prefers-color-scheme: dark) {
    /* 已在主题中处理 */
  }

  /* 高对比度模式 */
  @media (prefers-contrast: high) {
    * {
      text-shadow: none !important;
      box-shadow: none !important;
    }
    
    a {
      text-decoration: underline;
    }
  }

  /* Ant Design 组件样式覆盖 */
  .ant-layout {
    background: transparent;
  }

  .ant-menu-dark {
    background: ${props => props.theme.colors.background.secondary};
  }

  .ant-btn-primary {
    background: linear-gradient(135deg, #00D9FF 0%, #1890FF 50%, #722ED1 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    
    &:hover, &:focus {
      background: linear-gradient(135deg, #33E1FF 0%, #40A9FF 50%, #9254DE 100%);
      box-shadow: 0 6px 20px rgba(0, 217, 255, 0.4);
      transform: translateY(-1px);
    }
  }

  .ant-input, .ant-input-password {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: ${props => props.theme.colors.text.primary};
    backdrop-filter: blur(10px);
    font-weight: 500;
    
    &:focus, &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: ${props => props.theme.colors.primary.main};
      box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.2), 0 4px 12px rgba(0, 217, 255, 0.1);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 400;
    }
  }

  .ant-card {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    .ant-card-head-title {
      color: ${props => props.theme.colors.text.primary};
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  .ant-modal-content {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .ant-notification {
    .ant-notification-notice {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(20px);
      color: ${props => props.theme.colors.text.primary};
    }
  }
  
  /* 增强的文字样式 */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;
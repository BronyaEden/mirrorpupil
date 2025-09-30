import { createGlobalStyle } from 'styled-components';
import { mediaQuery } from './responsive';

export const GlobalStyles = createGlobalStyle`
  /* 全局重置样式 */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 防止移动端内容溢出 */
  html, body {
    overflow-x: hidden;
    width: 100vw;
    max-width: 100vw;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: linear-gradient(135deg, #1a2332 0%, #0d1b2a 100%);
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
    width: 100vw;
    max-width: 100vw;
    
    /* 移动端特殊处理 */
    ${mediaQuery.mobile(`
      width: 100vw;
      max-width: 100vw;
      overflow-x: hidden;
    `)}
  }

  #root {
    min-height: 100vh;
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #00d9ff 0%, #ff0080 100%);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #00ffff 0%, #ff00ff 100%);
  }

  /* 链接样式 */
  a {
    color: #00d9ff;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #00ffff;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }
  }

  /* 输入框样式 */
  input, textarea, select {
    font-family: inherit;
    outline: none;
  }

  /* 按钮样式 */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }

  /* 图片样式 */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* 移动端特殊优化 */
  ${mediaQuery.mobile(`
    /* 防止iOS缩放 */
    input, textarea, select {
      font-size: 16px;
    }
    
    /* 防止内容被导航栏遮挡 */
    body {
      padding: 0;
      margin: 0;
    }
    
    /* 当访问后台时隐藏前台导航栏 */
    body.hide-front-nav .mobile-navbar,
    body.hide-front-nav .mobile-top-navbar {
      display: none !important;
    }
    
    /* 后台内容区域适配 */
    body.hide-front-nav #root {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  `)}
`;
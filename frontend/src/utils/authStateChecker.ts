/**
 * 认证状态检查工具
 * 用于验证刷新后用户登录状态是否正确保持
 */

export const checkAuthState = (): void => {
  // 检查localStorage中的令牌
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('Auth State Check:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
    refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + '...' : null
  });
  
  // 如果有accessToken但没有用户信息，应该触发获取用户信息的操作
  if (accessToken) {
    console.log('Token found in localStorage, user should be authenticated');
  } else {
    console.log('No token found in localStorage, user should not be authenticated');
  }
};

// 页面加载时自动检查认证状态
window.addEventListener('load', () => {
  console.log('Page loaded, checking auth state...');
  checkAuthState();
});

export default checkAuthState;
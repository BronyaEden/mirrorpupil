// 图片URL处理工具函数

// 获取完整的图片URL
export const getFullImageUrl = (url: string | undefined): string | undefined => {
  console.log('getFullImageUrl called with:', { url, type: typeof url });
  
  // 检查url是否为有效字符串
  if (!url || typeof url !== 'string' || url === '') {
    console.log('Invalid URL, returning undefined');
    return undefined;
  }
  
  // 如果是MongoDB ObjectId，构造图片API URL
  if (/^[0-9a-fA-F]{24}$/.test(url)) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const fullUrl = `${backendUrl}/api/images/${url}`;
    console.log('ObjectId detected, returning API URL:', fullUrl);
    return fullUrl;
  }
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('Full URL detected, returning as is:', url);
    return url;
  }
  
  // 如果是相对路径，添加后端基础URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  // 确保URL格式正确
  const normalizedUrl = url.startsWith('/') ? url.substring(1) : url;
  const fullUrl = `${backendUrl}/${normalizedUrl}`;
  console.log('Relative path detected, returning full URL:', fullUrl);
  return fullUrl;
};
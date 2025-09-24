// 图片URL处理工具函数

// 获取完整的图片URL
export const getFullImageUrl = (url: string | undefined): string | undefined => {
  if (!url || url === '') return undefined;
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相对路径，添加后端基础URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  // 确保URL格式正确
  const normalizedUrl = url.startsWith('/') ? url.substring(1) : url;
  return `${backendUrl}/${normalizedUrl}`;
};
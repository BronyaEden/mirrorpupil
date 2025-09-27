import api from './index';

// 创建管理员专用的API实例
const adminApi = api.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// 管理员请求拦截器
adminApi.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 管理员响应拦截器
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Admin API Error:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 清除管理员令牌并跳转到登录页
      console.log('Admin API - Unauthorized, redirecting to login');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

const adminAPI = {
  // 认证相关
  login: (credentials: { username: string; password: string }) =>
    adminApi.post('/admin/login', credentials),

  // 仪表板数据
  getDashboardStats: () =>
    adminApi.get('/admin/dashboard/stats'),

  getAnalytics: (period: string = '7d') =>
    adminApi.get('/admin/analytics', { params: { period } }),

  // 用户管理
  getUsers: (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) =>
    adminApi.get('/admin/users', { params }),

  updateUser: (userId: string, userData: any) =>
    adminApi.put(`/admin/users/${userId}`, userData),

  toggleUserStatus: (userId: string) =>
    adminApi.patch(`/admin/users/${userId}/toggle-status`),

  deleteUser: (userId: string) =>
    adminApi.delete(`/admin/users/${userId}`),

  // 文件管理
  getFiles: (params: {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: string;
    isPublic?: boolean;
  }) =>
    adminApi.get('/admin/files', { params }),

  deleteFile: (fileId: string) =>
    adminApi.delete(`/admin/files/${fileId}`),

  batchDeleteFiles: (fileIds: string[]) =>
    adminApi.delete('/admin/files', { data: { fileIds } }),

  // 消息管理
  getMessages: (params: {
    page?: number;
    limit?: number;
    search?: string;
    messageType?: string;
  }) =>
    adminApi.get('/admin/messages', { params }),

  deleteMessage: (messageId: string) =>
    adminApi.delete(`/admin/messages/${messageId}`),

  // 系统管理
  getSystemLogs: (params: {
    page?: number;
    limit?: number;
    level?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    adminApi.get('/admin/system/logs', { params }),

  getSystemStatus: () =>
    adminApi.get('/admin/system/status'),

  // 设置管理
  getSettings: () =>
    adminApi.get('/admin/settings'),

  updateSettings: (settings: any) =>
    adminApi.put('/admin/settings', settings),
};

export default adminAPI;
import axios from 'axios';

// 创建标准API axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 增加到30秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建用于文件下载的axios实例
const fileApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // 增加到60秒
  responseType: 'blob', // 重要：设置响应类型为blob以处理二进制数据
});

// 创建用于获取基础文件信息的axios实例
const basicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 基础信息请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Adding Authorization header:', config.url, token.substring(0, 20) + '...');
    } else {
      console.log('API Request - No token found for:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 基础API请求拦截器
basicApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 文件API请求拦截器
fileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    console.error('Error config:', error.config);
    
    // 详细记录404错误
    if (error.response?.status === 404) {
      console.error('404 Error - Requested URL:', error.config?.url);
      console.error('404 Error - Base URL:', error.config?.baseURL);
      console.error('404 Error - Full URL:', error.config?.baseURL + error.config?.url);
    }
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

// 基础API响应拦截器
basicApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Basic API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 文件API响应拦截器
fileApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('File API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export { fileApi, basicApi };
export default api;
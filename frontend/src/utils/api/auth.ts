import api from './index';
import { LoginForm, RegisterForm, UpdateProfileForm, ChangePasswordForm } from '../../types';

const authAPI = {
  // 用户登录
  login: (credentials: LoginForm) => 
    api.post('/auth/login', credentials),

  // 用户注册
  register: (userData: RegisterForm) => 
    api.post('/auth/register', userData),

  // 刷新令牌
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh', { refreshToken }),

  // 获取用户信息
  getProfile: () => 
    api.get('/auth/profile'),

  // 更新用户信息
  updateProfile: (updateData: UpdateProfileForm) => 
    api.put('/auth/profile', updateData),

  // 修改密码
  changePassword: (passwords: ChangePasswordForm) => 
    api.put('/auth/change-password', passwords),

  // 关注用户
  followUser: (userId: string) => 
    api.post(`/auth/follow/${userId}`),

  // 取消关注
  unfollowUser: (userId: string) => 
    api.delete(`/auth/follow/${userId}`),

  // 获取用户的关注者列表
  getUserFollowers: (userId: string, page = 1, limit = 20) => 
    api.get(`/auth/users/${userId}/followers`, { params: { page, limit } }),

  // 获取用户的关注中列表
  getUserFollowing: (userId: string, page = 1, limit = 20) => 
    api.get(`/auth/users/${userId}/following`, { params: { page, limit } }),

  // 搜索用户
  searchUsers: (query: string, page = 1, limit = 20) => 
    api.get('/auth/search-users', { params: { q: query, page, limit } }),

  // 获取用户公开信息
  getUserPublicProfile: (userId: string) => 
    api.get(`/auth/users/${userId}`),

  // 上传头像
  uploadAvatar: (formData: FormData) => {
    console.log('Uploading avatar to /auth/upload-avatar');
    return api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传背景图
  uploadCover: (formData: FormData) => {
    console.log('Uploading cover to /auth/upload-cover');
    return api.post('/auth/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 更新用户名
  updateUsername: (username: string) => 
    api.put('/auth/update-username', { username }),

  // 登出
  logout: () => 
    api.post('/auth/logout'),
};

export default authAPI;
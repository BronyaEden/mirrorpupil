import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginForm, RegisterForm, UpdateProfileForm, ChangePasswordForm } from '../types';
import authAPI from '../utils/api/auth';

// 异步Actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginForm, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Login API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterForm, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '注册失败');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken(refreshToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '令牌刷新失败');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      // 调试信息
      const token = localStorage.getItem('accessToken');
      console.log('fetchUserProfile - Token from localStorage:', token ? token.substring(0, 20) + '...' : null);
      
      const response = await authAPI.getProfile();
      console.log('fetchUserProfile - Response:', response.data);
      return response.data.data.user;  // 注意这里使用了.data.data.user
    } catch (error: any) {
      console.error('fetchUserProfile - Error:', error);
      return rejectWithValue(error.response?.data?.message || '获取用户信息失败');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updateData: UpdateProfileForm, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(updateData);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新用户信息失败');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords: ChangePasswordForm, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(passwords);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '修改密码失败');
    }
  }
);

export const followUser = createAsyncThunk(
  'auth/followUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.followUser(userId);
      return { userId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '关注失败');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'auth/unfollowUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.unfollowUser(userId);
      return { userId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '取消关注失败');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await authAPI.uploadAvatar(formData);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '头像上传失败');
    }
  }
);

export const uploadCover = createAsyncThunk(
  'auth/uploadCover',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await authAPI.uploadCover(formData);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '背景图上传失败');
    }
  }
);

export const updateUsername = createAsyncThunk(
  'auth/updateUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateUsername(username);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '用户名更新失败');
    }
  }
);

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  loading: false,
  error: null,
};

console.log('Initial state - Tokens from localStorage:', {
  accessToken: localStorage.getItem('accessToken') ? localStorage.getItem('accessToken')?.substring(0, 20) + '...' : null,
  refreshToken: localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken')?.substring(0, 20) + '...' : null
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 登出
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    
    // 设置令牌
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    
    // 更新用户信息
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        // 确保令牌被正确存储到localStorage
        if (action.payload.data.accessToken) {
          localStorage.setItem('accessToken', action.payload.data.accessToken);
        }
        if (action.payload.data.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.data.refreshToken);
        }
        console.log('Login successful - Tokens stored in localStorage and Redux', {
          accessToken: action.payload.data.accessToken ? action.payload.data.accessToken.substring(0, 20) + '...' : null,
          refreshToken: action.payload.data.refreshToken ? action.payload.data.refreshToken.substring(0, 20) + '...' : null
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('Login failed:', state.error);
      });

    // 注册
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        // 确保令牌被正确存储到localStorage
        if (action.payload.data.accessToken) {
          localStorage.setItem('accessToken', action.payload.data.accessToken);
        }
        if (action.payload.data.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.data.refreshToken);
        }
        console.log('Registration successful - Tokens stored in localStorage and Redux', {
          accessToken: action.payload.data.accessToken ? action.payload.data.accessToken.substring(0, 20) + '...' : null,
          refreshToken: action.payload.data.refreshToken ? action.payload.data.refreshToken.substring(0, 20) + '...' : null
        });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 刷新令牌
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

    // 获取用户信息
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        console.log('fetchUserProfile fulfilled - User set in Redux:', action.payload);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('fetchUserProfile rejected:', state.error);
      });

    // 更新用户信息
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 修改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 关注用户
    builder
      .addCase(followUser.fulfilled, (state, action) => {
        if (state.user) {
          state.user.following.push(action.payload.userId);
          state.user.followingCount += 1;
        }
      });

    // 取消关注
    builder
      .addCase(unfollowUser.fulfilled, (state, action) => {
        if (state.user) {
          state.user.following = state.user.following.filter(id => id !== action.payload.userId);
          state.user.followingCount -= 1;
        }
      })

      // 上传头像
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user = action.payload;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // 上传背景图
      .addCase(uploadCover.fulfilled, (state, action) => {
        if (state.user) {
          state.user = action.payload;
        }
      })
      .addCase(uploadCover.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // 更新用户名
      .addCase(updateUsername.fulfilled, (state, action) => {
        if (state.user) {
          state.user = action.payload;
        }
      })
      .addCase(updateUsername.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout, setTokens, updateUser } = authSlice.actions;
export default authSlice.reducer;
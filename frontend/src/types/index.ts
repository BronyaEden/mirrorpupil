// 全局类型定义
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  isActive: boolean;
  isVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  // 添加isFollowing字段，用于表示当前用户是否关注此用户
  isFollowing?: boolean;
}

export interface FileItem {
  _id: string;
  filename: string;
  originalName: string;
  displayName: string;
  description?: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  fileSizeFormatted: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploaderId: string;
  uploader?: User;
  tags: string[];
  category?: string;
  downloadCount: number;
  viewCount: number;
  likeCount: number;
  likes: Array<{
    user: string;
    createdAt: Date;
  }>;
  isPublic: boolean;
  isActive: boolean;
  accessLevel: 'public' | 'private' | 'friends' | 'link';
  shareLink?: string;
  expiresAt?: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    codec?: string;
    bitrate?: number;
    fps?: number;
    sampleRate?: number;
  };
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  participants: User[];
  conversationType: 'private' | 'group';
  title?: string;
  description?: string;
  avatar?: string;
  lastMessage?: Message;
  lastMessageTime: Date;
  lastActivity: Date;
  isActive: boolean;
  participantCount: number;
  settings: {
    allowInvites: boolean;
    muteNotifications: boolean;
  };
  admins: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  messageType: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system';
  content?: string;
  fileId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    mimeType?: string;
  };
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  editedAt?: Date;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  replyTo?: string;
  reactions: Array<{
    user: string;
    emoji: string;
    createdAt: Date;
  }>;
  mentions: string[];
  isSystemMessage: boolean;
  systemData?: any;
  isRead: boolean;
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface FilesState {
  files: FileItem[];
  currentFile: FileItem | null;
  searchResults: FileItem[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  filters: {
    fileType?: string;
    category?: string;
    dateRange?: [Date, Date];
    sortBy: 'createdAt' | 'downloadCount' | 'likeCount' | 'fileSize';
    sortOrder: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UsersState {
  searchResults: User[];
  currentProfile: User | null;
  followers: User[];
  following: User[];
  loading: boolean;
  error: string | null;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  onlineUsers: string[];
  typing: Record<string, string[]>; // conversationId -> userIds
  loading: boolean;
  error: string | null;
  connected: boolean;
}

export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  loading: Record<string, boolean>;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  modals: Record<string, boolean>;
}

export interface RootState {
  auth: AuthState;
  files: FilesState;
  users: UsersState;
  chat: ChatState;
  ui: UIState;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 表单类型
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileForm {
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  preferences?: Partial<User['preferences']>;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface FileUploadForm {
  displayName: string;
  description?: string;
  tags: string[];
  category?: string;
  isPublic: boolean;
  accessLevel: 'public' | 'private' | 'friends' | 'link';
}



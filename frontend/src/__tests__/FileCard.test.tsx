import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from 'styled-components';
import FileCard from '../components/FileCard';
import { FileItem } from '../types';
import { theme } from '../styles/theme';
import authReducer from '../store/authSlice';

// 创建测试用的store
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
};

// 测试渲染辅助函数
const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

// 模拟文件数据
const mockFile: FileItem = {
  _id: '1',
  filename: 'test.jpg',
  originalName: 'test.jpg',
  displayName: '测试图片',
  description: '这是一个测试图片文件',
  fileType: 'image',
  mimeType: 'image/jpeg',
  fileSize: 1024000,
  fileSizeFormatted: '1.02 MB',
  fileUrl: '/uploads/test.jpg',
  thumbnailUrl: '/uploads/thumb_test.jpg',
  uploaderId: 'user1',
  uploader: {
    _id: 'user1',
    username: '测试用户',
    email: 'test@example.com',
    avatar: '',
    bio: '',
    location: '',
    website: '',
    followers: [],
    following: [],
    followersCount: 0,
    followingCount: 0,
    isActive: true,
    isVerified: false,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: 'auto',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: true
      }
    }
  },
  tags: ['测试', '图片'],
  category: '图片素材',
  downloadCount: 10,
  viewCount: 25,
  likeCount: 5,
  likes: [],
  isPublic: true,
  isActive: true,
  accessLevel: 'public',
  metadata: {
    width: 1920,
    height: 1080
  },
  processing: {
    status: 'completed',
    progress: 100
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15')
};

describe('FileCard', () => {
  test('应该渲染文件基本信息', () => {
    renderWithProviders(<FileCard file={mockFile} />);
    
    expect(screen.getByText('测试图片')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试图片文件')).toBeInTheDocument();
    expect(screen.getByText('1.02 MB • image/jpeg')).toBeInTheDocument();
    expect(screen.getByText('测试用户')).toBeInTheDocument();
  });

  test('应该显示文件统计信息', () => {
    renderWithProviders(<FileCard file={mockFile} />);
    
    expect(screen.getByText('25')).toBeInTheDocument(); // 查看次数
    expect(screen.getByText('10')).toBeInTheDocument(); // 下载次数
    expect(screen.getByText('5')).toBeInTheDocument();  // 点赞数
  });

  test('应该显示文件标签', () => {
    renderWithProviders(<FileCard file={mockFile} />);
    
    expect(screen.getByText('测试')).toBeInTheDocument();
    expect(screen.getByText('图片')).toBeInTheDocument();
  });

  test('应该显示操作按钮', () => {
    renderWithProviders(<FileCard file={mockFile} showActions={true} />);
    
    expect(screen.getByText('下载')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /下载/ })).toBeInTheDocument();
  });

  test('当showActions为false时不应该显示操作按钮', () => {
    renderWithProviders(<FileCard file={mockFile} showActions={false} />);
    
    expect(screen.queryByText('下载')).not.toBeInTheDocument();
  });

  test('应该处理图片文件的缩略图', () => {
    renderWithProviders(<FileCard file={mockFile} />);
    
    const thumbnailImage = screen.getByAltText('测试图片');
    expect(thumbnailImage).toBeInTheDocument();
    expect(thumbnailImage).toHaveAttribute('src', '/uploads/thumb_test.jpg');
  });

  test('对于非图片文件应该显示图标', () => {
    const docFile = {
      ...mockFile,
      fileType: 'document' as const,
      mimeType: 'application/pdf',
      thumbnailUrl: undefined
    };
    
    renderWithProviders(<FileCard file={docFile} />);
    
    // 应该显示文档图标而不是图片
    expect(screen.queryByAltText('测试图片')).not.toBeInTheDocument();
  });
});
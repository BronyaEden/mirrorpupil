import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Avatar,
  Typography,
  Button,
  Space,
  Tabs,
  Row,
  Col,
  Statistic,
  Tag,
  Divider,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Empty,
  Spin
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  EditOutlined,
  UploadOutlined,
  HeartOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateUserProfile } from '../../store/authSlice';
import FileCard from '../../components/FileCard';
import { User, FileItem } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface UserProfileProps {}

interface UserStats {
  totalFiles: number;
  totalViews: number;
  totalDownloads: number;
  totalLikes: number;
}

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const ProfileHeader = styled(Card)`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.background.secondary} 0%, 
    ${props => props.theme.colors.background.surface} 100%);
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  .ant-card-body {
    padding: ${props => props.theme.spacing.xl};
  }
`;

const ProfileAvatar = styled(Avatar)`
  border: 4px solid ${props => props.theme.colors.primary.main};
  box-shadow: ${props => props.theme.shadows.glow};
`;

const UserInfo = styled.div`
  .user-name {
    color: ${props => props.theme.colors.text.primary};
    font-size: 2rem;
    font-weight: 700;
    margin: ${props => props.theme.spacing.md} 0 ${props => props.theme.spacing.sm};
  }
  
  .user-bio {
    color: ${props => props.theme.colors.text.secondary};
    font-size: 1.1rem;
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  .user-meta {
    color: ${props => props.theme.colors.text.secondary};
    font-size: 0.9rem;
    
    .ant-space-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const StatsCard = styled(Card)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-align: center;
  
  .ant-statistic-content {
    color: ${props => props.theme.colors.text.primary};
  }
  
  .ant-statistic-title {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const ContentTabs = styled(Tabs)`
  .ant-tabs-nav {
    background: ${props => props.theme.colors.background.secondary};
    border-radius: ${props => props.theme.borderRadius.lg};
    padding: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.lg};
  }
  
  .ant-tabs-tab {
    color: ${props => props.theme.colors.text.secondary};
    
    &.ant-tabs-tab-active {
      color: ${props => props.theme.colors.primary.main};
    }
  }
  
  .ant-tabs-ink-bar {
    background: ${props => props.theme.colors.primary.main};
  }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const EditModal = styled(Modal)`
  .ant-modal-content {
    background: ${props => props.theme.colors.background.secondary};
    border: 1px solid ${props => props.theme.colors.neutral.gray400};
  }
  
  .ant-modal-header {
    background: ${props => props.theme.colors.background.secondary};
    border-bottom: 1px solid ${props => props.theme.colors.neutral.gray400};
  }
  
  .ant-modal-title {
    color: ${props => props.theme.colors.text.primary};
  }
`;

// 模拟数据
const mockUserData: User = {
  _id: 'user1',
  username: '示例用户',
  email: 'user@example.com',
  avatar: '',
  bio: '这是一个示例用户的个人简介，展示用户的基本信息和兴趣爱好。',
  location: '北京市',
  website: 'https://example.com',
  followers: [],
  following: [],
  followersCount: 128,
  followingCount: 56,
  isActive: true,
  isVerified: true,
  role: 'user',
  lastLoginAt: new Date('2024-01-20'),
  createdAt: new Date('2023-06-15'),
  updatedAt: new Date('2024-01-20'),
  preferences: {
    theme: 'auto',
    language: 'zh-CN',
    notifications: {
      email: true,
      push: true
    }
  }
};

const mockUserStats: UserStats = {
  totalFiles: 45,
  totalViews: 1234,
  totalDownloads: 567,
  totalLikes: 89
};

const mockUserFiles: FileItem[] = [
  {
    _id: '1',
    filename: 'user-file1.jpg',
    originalName: 'user-file1.jpg',
    displayName: '用户上传的图片1',
    description: '这是用户上传的一个示例图片',
    fileType: 'image',
    mimeType: 'image/jpeg',
    fileSize: 1024000,
    fileSizeFormatted: '1.02 MB',
    fileUrl: '/uploads/user-file1.jpg',
    thumbnailUrl: '/uploads/thumb_user-file1.jpg',
    uploaderId: 'user1',
    uploader: mockUserData,
    tags: ['图片', '示例'],
    category: '图片素材',
    downloadCount: 25,
    viewCount: 78,
    likeCount: 12,
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
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  }
];

const UserProfile: React.FC<UserProfileProps> = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser, loading } = useSelector((state: RootState) => state.auth);
  
  const [userData, setUserData] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('files');
  
  const isOwnProfile = currentUser?._id === userId;
  
  useEffect(() => {
    // 模拟加载用户数据
    const loadUserData = async () => {
      setDataLoading(true);
      // 模拟API调用
      setTimeout(() => {
        if (isOwnProfile && currentUser) {
          setUserData(currentUser);
        } else {
          setUserData(mockUserData);
        }
        setUserStats(mockUserStats);
        setUserFiles(mockUserFiles);
        setDataLoading(false);
      }, 1000);
    };
    
    loadUserData();
  }, [userId, currentUser, isOwnProfile]);
  
  const handleEditProfile = () => {
    if (userData) {
      editForm.setFieldsValue({
        bio: userData.bio,
        location: userData.location,
        website: userData.website
      });
      setEditModalVisible(true);
    }
  };
  
  const handleSaveProfile = async (values: any) => {
    try {
      // 这里应该调用实际的API
      await dispatch(updateUserProfile(values)).unwrap();
      message.success('资料更新成功！');
      setEditModalVisible(false);
      
      // 更新本地数据
      if (userData) {
        setUserData({ ...userData, ...values });
      }
    } catch (error: any) {
      message.error(error || '更新失败');
    }
  };
  
  const handleFollow = async () => {
    // 实现关注逻辑
    message.info('关注功能待实现');
  };
  
  const handleFileAction = (action: string, file: FileItem) => {
    console.log(`${action} file:`, file);
    // 实现文件操作逻辑
  };
  
  if (dataLoading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </ProfileContainer>
    );
  }
  
  if (!userData) {
    return (
      <ProfileContainer>
        <Empty description="用户不存在" style={{ color: '#B0BEC5', padding: '100px 0' }} />
      </ProfileContainer>
    );
  }
  
  return (
    <ProfileContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 用户信息头部 */}
        <ProfileHeader>
          <Row gutter={24} align="middle">
            <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
              <ProfileAvatar
                size={120}
                src={userData.avatar}
                icon={<UserOutlined />}
              />
            </Col>
            
            <Col xs={24} sm={12}>
              <UserInfo>
                <div className="user-name">
                  {userData.username}
                  {userData.isVerified && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>已验证</Tag>
                  )}
                </div>
                
                {userData.bio && (
                  <Paragraph className="user-bio">
                    {userData.bio}
                  </Paragraph>
                )}
                
                <Space className="user-meta" split={<Divider type="vertical" />}>
                  {userData.location && (
                    <span>
                      <EnvironmentOutlined />
                      {userData.location}
                    </span>
                  )}
                  {userData.website && (
                    <span>
                      <GlobalOutlined />
                      <a href={userData.website} target="_blank" rel="noopener noreferrer">
                        个人网站
                      </a>
                    </span>
                  )}
                  <span>
                    <CalendarOutlined />
                    加入于 {dayjs(userData.createdAt).fromNow()}
                  </span>
                </Space>
              </UserInfo>
            </Col>
            
            <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {isOwnProfile ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                    block
                  >
                    编辑资料
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleFollow}
                    block
                  >
                    关注
                  </Button>
                )}
                
                {isOwnProfile && (
                  <Button
                    icon={<SettingOutlined />}
                    block
                  >
                    设置
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </ProfileHeader>
        
        {/* 统计数据 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <StatsCard>
              <Statistic
                title="文件数量"
                value={userStats?.totalFiles || 0}
                prefix={<FileOutlined />}
              />
            </StatsCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatsCard>
              <Statistic
                title="总浏览量"
                value={userStats?.totalViews || 0}
                prefix={<EyeOutlined />}
              />
            </StatsCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatsCard>
              <Statistic
                title="总下载量"
                value={userStats?.totalDownloads || 0}
                prefix={<DownloadOutlined />}
              />
            </StatsCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatsCard>
              <Statistic
                title="获得点赞"
                value={userStats?.totalLikes || 0}
                prefix={<HeartOutlined />}
              />
            </StatsCard>
          </Col>
        </Row>
        
        {/* 内容标签页 */}
        <ContentTabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="上传的文件" key="files">
            {userFiles.length > 0 ? (
              <FileGrid>
                {userFiles.map((file, index) => (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <FileCard
                      file={file}
                      onDownload={(file) => handleFileAction('download', file)}
                      onLike={(file) => handleFileAction('like', file)}
                      onShare={(file) => handleFileAction('share', file)}
                      onPreview={(file) => handleFileAction('preview', file)}
                      onEdit={isOwnProfile ? (file) => handleFileAction('edit', file) : undefined}
                      onDelete={isOwnProfile ? (file) => handleFileAction('delete', file) : undefined}
                      showActions={true}
                      isOwner={isOwnProfile}
                    />
                  </motion.div>
                ))}
              </FileGrid>
            ) : (
              <Empty
                description={isOwnProfile ? "您还没有上传任何文件" : "该用户还没有上传任何文件"}
                style={{ color: '#B0BEC5', padding: '60px 0' }}
              />
            )}
          </TabPane>
          
          <TabPane tab={`关注者 (${userData.followersCount})`} key="followers">
            <Empty
              description="关注者列表功能待实现"
              style={{ color: '#B0BEC5', padding: '60px 0' }}
            />
          </TabPane>
          
          <TabPane tab={`关注中 (${userData.followingCount})`} key="following">
            <Empty
              description="关注列表功能待实现"
              style={{ color: '#B0BEC5', padding: '60px 0' }}
            />
          </TabPane>
          
          <TabPane tab="点赞的文件" key="liked">
            <Empty
              description="点赞列表功能待实现"
              style={{ color: '#B0BEC5', padding: '60px 0' }}
            />
          </TabPane>
        </ContentTabs>
      </motion.div>
      
      {/* 编辑资料弹窗 */}
      <EditModal
        title="编辑个人资料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Form.Item
            name="bio"
            label="个人简介"
          >
            <TextArea
              rows={3}
              placeholder="介绍一下自己..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="location"
            label="所在地"
          >
            <Input
              placeholder="输入您的所在地"
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>
          
          <Form.Item
            name="website"
            label="个人网站"
            rules={[
              { type: 'url', message: '请输入有效的网址' }
            ]}
          >
            <Input
              placeholder="输入您的个人网站"
              prefix={<GlobalOutlined />}
            />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </EditModal>
    </ProfileContainer>
  );
};

export default UserProfile;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Spin,
  Popconfirm
} from 'antd';
import ImageCropper from '../../components/ImageCropper';
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
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserProfile, updateUserProfile, uploadAvatar, uploadCover, updateUsername, setTokens, updateUser } from '../../store/authSlice';
import FileCard from '../../components/FileCard';
import FollowList from '../../components/FollowList';
import { User, FileItem } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import authAPI from '../../utils/api/auth';
import api from '../../utils/api';
import { getFullImageUrl } from '../../utils/imageUtils';

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

// 添加一个新的接口来表示关注状态
interface FollowStatus {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const ProfileHeader = styled.div<{ $coverImage?: string }>`
  position: relative;
  height: 300px;
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$coverImage ? 'rgba(0, 0, 0, 0.3)' : 'linear-gradient(135deg, #00D9FF 0%, #0099CC 50%, #0066FF 100%)'};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    ${props => props.$coverImage && `background-image: url(${props.$coverImage});`}
  }
`;

const ProfileAvatar = styled(Avatar)`
  border: 4px solid ${props => props.theme.colors.background.surface};
  box-shadow: ${props => props.theme.shadows.glow};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const UserInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 2;
  color: white;
  
  .user-name {
    font-size: 2rem;
    font-weight: 700;
    margin: ${props => props.theme.spacing.md} 0 ${props => props.theme.spacing.sm};
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .user-bio {
    font-size: 1.1rem;
    margin-bottom: ${props => props.theme.spacing.md};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    color: #ccc; /* 浅灰色 */
  }
  
  .user-meta {
    font-size: 0.9rem;
    
    .ant-space-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const CoverUploadButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    color: white;
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

const UploadModal = styled(Modal)`
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

const Dragger = styled(Upload.Dragger)`
  background: ${props => props.theme.colors.background.surface} !important;
  border: 1px dashed ${props => props.theme.colors.neutral.gray400} !important;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary.main} !important;
  }
`;

const ChatButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  padding: 0 24px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    background: linear-gradient(135deg, #764ba2, #667eea);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const UserProfile: React.FC<UserProfileProps> = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser, loading, isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  
  const [userData, setUserData] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [uploadType, setUploadType] = useState<'avatar' | 'cover'>('avatar');
  const [editForm] = Form.useForm();
  const [usernameForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('files');
  
  // 添加关注状态
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    isFollowing: false,
    followersCount: 0,
    followingCount: 0
  });
  
  // 裁剪相关状态
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [tempAvatarSrc, setTempAvatarSrc] = useState('');
  const [tempCoverSrc, setTempCoverSrc] = useState('');
  const [isCroppingCover, setIsCroppingCover] = useState(false);
  
  const isOwnProfile = !userId || (currentUser?._id === userId);
  
  // 检查是否正在恢复用户状态
  const isRestoringUser = !userId && !currentUser && loading;
  
  // 检查是否有访问令牌但没有用户信息（可能正在恢复过程中）
  const isUserRecoveryNeeded = !userId && !currentUser && !!accessToken;
  
  useEffect(() => {
    // 调试信息
    const localAccessToken = localStorage.getItem('accessToken');
    console.log('UserProfile useEffect triggered', {
      userId,
      currentUser: !!currentUser,
      isAuthenticated,
      accessToken: !!accessToken,
      localAccessToken: !!localAccessToken,
      localAccessTokenValue: localAccessToken ? localAccessToken.substring(0, 20) + '...' : null,
      loading,
      isOwnProfile,
      isUserRecoveryNeeded
    });
    
    // 如果有本地令牌但没有Redux中的令牌，尝试从localStorage同步
    if (localAccessToken && !accessToken) {
      console.log('Syncing accessToken from localStorage to Redux');
      dispatch(setTokens({
        accessToken: localAccessToken || '',
        refreshToken: localStorage.getItem('refreshToken') || ''
      }));
    }
    
    const loadUserData = async () => {
      setDataLoading(true);
      
      try {
        if (isOwnProfile && currentUser) {
          // 如果是查看自己的资料，直接使用当前用户数据
          console.log('Using current user data', currentUser);
          setUserData(currentUser);
          setFollowStatus({
            isFollowing: false,
            followersCount: currentUser.followersCount || 0,
            followingCount: currentUser.followingCount || 0
          });
          await loadUserStatsAndFiles(currentUser._id);
        } else if (userId) {
          // 如果是查看其他用户的资料
          console.log('Loading public profile for user', userId);
          const response = await authAPI.getUserPublicProfile(userId);
          if (response.data.success) {
            const userProfile = response.data.data.user;
            setUserData(userProfile);
            setFollowStatus({
              isFollowing: currentUser?.following?.includes(userId) || false,
              followersCount: userProfile.followersCount || 0,
              followingCount: userProfile.followingCount || 0
            });
            await loadUserStatsAndFiles(userId);
          }
        } else if (isUserRecoveryNeeded) {
          // 如果需要恢复用户状态，等待恢复完成
          console.log('User recovery needed, waiting...');
          setDataLoading(false);
          return;
        } else {
          // 如果未登录且没有userId，不进行重定向，而是显示登录提示
          console.log('Not logged in, showing login prompt');
          setDataLoading(false);
          return;
        }
      } catch (error: any) {
        console.error('Error loading user data', error);
        message.error(error.response?.data?.message || '获取用户信息失败');
        if (error.response?.status === 404) {
          navigate('/');
        }
      } finally {
        setDataLoading(false);
      }
    };
    
    loadUserData();
  }, [userId, currentUser, isOwnProfile, isAuthenticated, accessToken, loading, isUserRecoveryNeeded]);
  
  const loadUserStatsAndFiles = async (userId: string) => {
    // 模拟统计数据
    setUserStats({
      totalFiles: 15,
      totalViews: 1234,
      totalDownloads: 567,
      totalLikes: 89
    });
    
    // 模拟文件数据
    setUserFiles([
      // 这里应该是从API获取的实际文件数据
    ]);
  };
  
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
      const response = await dispatch(updateUserProfile(values)).unwrap();
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
    if (!userData || !currentUser) {
      message.info('请先登录');
      navigate('/auth');
      return;
    }
    
    try {
      const response = await authAPI.followUser(userData._id);
      if (response.data.success) {
        message.success('关注成功');
        // 更新关注状态
        setFollowStatus(prev => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1
        }));
        // 更新当前用户信息中的following列表
        if (currentUser) {
          dispatch(updateUser({
            following: [...(currentUser.following || []), userData._id]
          }));
        }
      }
    } catch (error: any) {
      console.error('关注失败:', error);
      message.error(error.response?.data?.message || '关注失败');
    }
  };
  
  const handleUnfollow = async () => {
    if (!userData || !currentUser) {
      message.info('请先登录');
      navigate('/auth');
      return;
    }
    
    try {
      const response = await authAPI.unfollowUser(userData._id);
      if (response.data.success) {
        message.success('取消关注成功');
        // 更新关注状态
        setFollowStatus(prev => ({
          ...prev,
          isFollowing: false,
          followersCount: prev.followersCount - 1
        }));
        // 更新当前用户信息中的following列表
        if (currentUser) {
          dispatch(updateUser({
            following: (currentUser.following || []).filter(id => id !== userData._id)
          }));
        }
      }
    } catch (error: any) {
      console.error('取消关注失败:', error);
      message.error(error.response?.data?.message || '取消关注失败');
    }
  };
  
  const handleChatClick = async () => {
    if (!userData) return;
    
    try {
      // 创建或获取与该用户的私人会话
      const response = await api.post('/chat/conversations', {
        participantIds: [userData._id],
        conversationType: 'private'
      });
      
      if (response.data.success) {
        const conversation = response.data.data.conversation;
        // 跳转到消息页面，并传递会话ID作为参数
        navigate(`/messages?conversationId=${conversation._id}`);
      }
    } catch (error: any) {
      console.error('创建会话失败:', error);
      message.error(error.response?.data?.message || '创建会话失败');
    }
  };
  
  const handleFileAction = (action: string, file: FileItem) => {
    console.log(`${action} file:`, file);
    // 实现文件操作逻辑
  };
  
  const handleUploadAvatar = () => {
    setUploadType('avatar');
    setUploadModalVisible(true);
  };
  
  const handleUploadCover = () => {
    setUploadType('cover');
    setUploadModalVisible(true);
  };
  
  const handleUpload = async (file: any) => {
    // 读取文件并显示裁剪模态框
    const reader = new FileReader();
    reader.onload = (e) => {
      if (uploadType === 'avatar') {
        setTempAvatarSrc(e.target?.result as string);
      } else {
        setTempCoverSrc(e.target?.result as string);
        setIsCroppingCover(true);
      }
      setUploadModalVisible(false);
      setCropModalVisible(true);
    };
    reader.readAsDataURL(file);
    
    return false;
  };
  
  // 处理裁剪完成
  const handleCropComplete = async (croppedImage: string) => {
    setCropModalVisible(false);
    
    try {
      // 将裁剪后的图片转换为Blob并上传
      const blob = await fetch(croppedImage).then(res => res.blob());
      
      if (isCroppingCover) {
        // 处理背景图
        const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('cover', file);
        
        console.log('Uploading cropped cover image...');
        const response = await dispatch(uploadCover(formData)).unwrap();
        message.success('背景图上传成功！');
        
        // 更新本地数据
        if (response && response.coverImage) {
          console.log('Cover image updated, updating local state', response);
          setUserData(prev => prev ? { ...prev, coverImage: response.coverImage } : prev);
          // 同时更新Redux store中的用户信息
          dispatch(updateUser({ coverImage: response.coverImage }));
        }
        
        // 重置状态
        setIsCroppingCover(false);
      } else {
        // 处理头像
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        console.log('Uploading cropped avatar...');
        const response = await dispatch(uploadAvatar(formData)).unwrap();
        message.success('头像上传成功！');
        
        // 更新本地数据
        if (response && response.avatar) {
          console.log('Avatar updated, updating local state', response);
          setUserData(prev => prev ? { ...prev, avatar: response.avatar } : prev);
          // 同时更新Redux store中的用户信息
          dispatch(updateUser({ avatar: response.avatar }));
        }
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      message.error(error.message || '图片上传失败');
    }
  };
  
  const handleUpdateUsername = () => {
    if (userData) {
      usernameForm.setFieldsValue({
        username: userData.username
      });
      setUsernameModalVisible(true);
    }
  };
  
  const handleSaveUsername = async (values: any) => {
    try {
      await dispatch(updateUsername(values.username)).unwrap();
      message.success('用户名更新成功！');
      setUsernameModalVisible(false);
      
      // 更新本地数据
      if (userData) {
        setUserData({ ...userData, username: values.username });
      }
    } catch (error: any) {
      message.error(error || '用户名更新失败');
    }
  };
  
  // 如果正在恢复用户状态，显示加载中
  if (isRestoringUser || isUserRecoveryNeeded) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </ProfileContainer>
    );
  }
  
  if (dataLoading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </ProfileContainer>
    );
  }
  
  if (!userData && !isOwnProfile) {
    return (
      <ProfileContainer>
        <Empty description="用户不存在" style={{ color: '#B0BEC5', padding: '100px 0' }} />
      </ProfileContainer>
    );
  }
  
  // 如果未登录用户访问个人中心页面
  if (isOwnProfile && !currentUser && !isRestoringUser && !isUserRecoveryNeeded) {
    return (
      <ProfileContainer>
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={3}>请登录以查看个人中心</Title>
          <Paragraph>您需要登录才能查看和编辑个人资料</Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/auth')}>
            立即登录
          </Button>
        </Card>
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
        <ProfileHeader $coverImage={getFullImageUrl(userData?.coverImage) || undefined}>
          {isOwnProfile && (
            <CoverUploadButton 
              icon={<UploadOutlined />} 
              onClick={handleUploadCover}
            >
              编辑背景图
            </CoverUploadButton>
          )}
          
          <UserInfo>
            <ProfileAvatar
              size={120}
              src={getFullImageUrl(userData?.avatar) || undefined}
              icon={<UserOutlined />}
              onClick={isOwnProfile ? handleUploadAvatar : undefined}
            />
            
            <div className="user-name">
              {userData?.username}
              {userData?.isVerified && (
                <Tag color="blue" style={{ marginLeft: 8 }}>已验证</Tag>
              )}
            </div>
            
            {userData?.bio && (
              <Paragraph className="user-bio">
                {userData?.bio}
              </Paragraph>
            )}
            
            <Space className="user-meta" split={<Divider type="vertical" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />}>
              {userData?.location && (
                <span>
                  <EnvironmentOutlined />
                  {userData?.location}
                </span>
              )}
              {userData?.website && (
                <span>
                  <GlobalOutlined />
                  <a href={userData?.website} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                    个人网站
                  </a>
                </span>
              )}
              <span>
                <CalendarOutlined />
                加入于 {userData?.createdAt ? dayjs(userData.createdAt).fromNow() : ''}
              </span>
            </Space>
          </UserInfo>
        </ProfileHeader>
        
        <Card style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                {isOwnProfile ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                  >
                    编辑资料
                  </Button>
                ) : (
                  <>
                    {followStatus.isFollowing ? (
                      <Popconfirm
                        title="确定要取消关注吗？"
                        onConfirm={handleUnfollow}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          type="default"
                          danger
                        >
                          取消关注
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button
                        type="primary"
                        onClick={handleFollow}
                      >
                        关注
                      </Button>
                    )}
                    <ChatButton
                      icon={<MessageOutlined />}
                      onClick={() => handleChatClick()}
                    >
                      聊天
                    </ChatButton>
                  </>
                )}
                
                {isOwnProfile && (
                  <Button
                    icon={<SettingOutlined />}
                    onClick={handleUpdateUsername}
                  >
                    修改用户名
                  </Button>
                )}
              </Space>
            </Col>
            
            <Col>
              <Space>
                <Text strong>关注者: {followStatus.followersCount}</Text>
                <Text strong>关注中: {followStatus.followingCount}</Text>
              </Space>
            </Col>
          </Row>
        </Card>
        
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
          
          <TabPane tab={`关注者 (${followStatus.followersCount})`} key="followers">
            {userData && (
              <FollowList userId={userData._id} type="followers" />
            )}
          </TabPane>
          
          <TabPane tab={`关注中 (${followStatus.followingCount})`} key="following">
            {userData && (
              <FollowList userId={userData._id} type="following" />
            )}
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
              maxLength={300}
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
              maxLength={100}
            />
          </Form.Item>
          
          <Form.Item
            name="website"
            label="个人网站"
          >
            <Input
              placeholder="输入您的个人网站"
              prefix={<GlobalOutlined />}
              maxLength={200}
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
      
      {/* 上传弹窗 */}
      <UploadModal
        title={uploadType === 'avatar' ? '上传头像' : '上传背景图'}
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={500}
      >
        <Dragger
          name={uploadType}
          showUploadList={false}
          beforeUpload={handleUpload}
          accept="image/*"
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            点击或拖拽文件到此区域上传
          </p>
          <p className="ant-upload-hint">
            {uploadType === 'avatar' 
              ? '支持JPG、PNG、GIF格式，文件大小不超过2MB' 
              : '支持JPG、PNG、GIF格式，文件大小不超过5MB'}
          </p>
        </Dragger>
      </UploadModal>
      
      {/* 图片裁剪弹窗 */}
      <ImageCropper
        imageSrc={isCroppingCover ? tempCoverSrc : tempAvatarSrc}
        visible={cropModalVisible}
        onCancel={() => {
          setCropModalVisible(false);
          setIsCroppingCover(false);
        }}
        onCropComplete={handleCropComplete}
        cropType={isCroppingCover ? 'cover' : 'avatar'}
        coverFillMode="cover" // 使用cover模式确保背景图完全覆盖
      />
      
      {/* 用户名修改弹窗 */}
      <EditModal
        title="修改用户名"
        open={usernameModalVisible}
        onCancel={() => setUsernameModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={usernameForm}
          layout="vertical"
          onFinish={handleSaveUsername}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入新的用户名" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setUsernameModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
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
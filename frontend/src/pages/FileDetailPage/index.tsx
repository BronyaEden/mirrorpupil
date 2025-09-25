import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Avatar,
  Divider,
  Spin,
  message
} from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined, 
  LikeOutlined, 
  ShareAltOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FileItem } from '../../types';
import { getFullImageUrl } from '../../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

const FileDetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
`;

const FileHeader = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilePreview = styled.div`
  flex: 1;
  min-width: 300px;
  background: rgba(31, 41, 55, 0.5);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border: 1px solid rgba(75, 85, 99, 0.5);
`;

const FileInfo = styled.div`
  flex: 2;
  background: rgba(31, 41, 55, 0.5);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(75, 85, 99, 0.5);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  .ant-btn {
    flex: 1;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(31, 41, 55, 0.3);
  border-radius: 8px;
  margin-top: 16px;
`;

const FileDetailPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    // 模拟获取文件详情
    const fetchFileDetail = async () => {
      setLoading(true);
      try {
        // 这里应该调用实际的API获取文件详情
        // const response = await fileAPI.getFileDetail(fileId);
        // setFile(response.data);
        
        // 模拟数据
        setTimeout(() => {
          const mockFile: FileItem = {
            _id: fileId || '1',
            filename: 'example-file.pdf',
            originalName: 'Example Document.pdf',
            displayName: '示例文档',
            description: '这是一个示例文档，用于演示文件详情页面的展示效果。文档包含了丰富的信息和内容，可以帮助用户了解文件的详细信息。',
            fileType: 'document',
            mimeType: 'application/pdf',
            fileSize: 2048000,
            fileSizeFormatted: '2MB',
            fileUrl: '/uploads/example-file.pdf',
            thumbnailUrl: '/uploads/example-thumbnail.jpg',
            uploaderId: 'user123',
            uploader: {
              _id: 'user123',
              username: '示例用户',
              email: 'user@example.com',
              avatar: '/uploads/avatar.jpg',
              coverImage: '/uploads/cover.jpg',
              bio: '这是一个示例用户',
              location: '北京',
              website: 'https://example.com',
              followers: [],
              following: [],
              followersCount: 100,
              followingCount: 50,
              isActive: true,
              isVerified: true,
              role: 'user',
              lastLoginAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              preferences: {
                theme: 'dark',
                language: 'zh-CN',
                notifications: {
                  email: true,
                  push: true
                }
              }
            },
            tags: ['文档', '示例', '教程'],
            category: '学习资料',
            downloadCount: 1500,
            viewCount: 3200,
            likeCount: 89,
            likes: [],
            isPublic: true,
            isActive: true,
            accessLevel: 'public',
            metadata: {},
            processing: {
              status: 'completed',
              progress: 100,
              message: '处理完成'
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          setFile(mockFile);
          setLikeCount(mockFile.likeCount);
          setLoading(false);
        }, 1000);
      } catch (error) {
        message.error('获取文件详情失败');
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFileDetail();
    }
  }, [fileId]);

  const handleDownload = () => {
    if (!file) return;
    message.success('开始下载文件');
    // 这里应该调用实际的下载API
  };

  const handlePreview = () => {
    if (!file) return;
    message.info('预览功能待实现');
    // 这里应该实现文件预览功能
  };

  const handleLike = () => {
    if (!file) return;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    message.success(liked ? '取消点赞' : '点赞成功');
    // 这里应该调用实际的点赞API
  };

  const handleShare = () => {
    message.info('分享功能待实现');
    // 这里应该实现分享功能
  };

  if (loading) {
    return (
      <FileDetailContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </FileDetailContainer>
    );
  }

  if (!file) {
    return (
      <FileDetailContainer>
        <Card style={{ textAlign: 'center', padding: '60px' }}>
          <Title level={3}>文件未找到</Title>
          <Text type="secondary">抱歉，您要查看的文件不存在或已被删除。</Text>
        </Card>
      </FileDetailContainer>
    );
  }

  return (
    <FileDetailContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title level={2} style={{ color: '#fff', marginBottom: 32 }}>
          {file.displayName}
        </Title>
        
        <FileHeader>
          <FilePreview>
            {file.thumbnailUrl ? (
              <img 
                src={getFullImageUrl(file.thumbnailUrl)} 
                alt={file.displayName}
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
              />
            ) : (
              <div style={{ 
                width: '200px', 
                height: '200px', 
                background: 'rgba(55, 65, 81, 0.5)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                <EyeInvisibleOutlined />
              </div>
            )}
            <Text style={{ marginTop: 16, color: '#9ca3af' }}>
              {file.fileType.toUpperCase()} 文件
            </Text>
          </FilePreview>
          
          <FileInfo>
            <Title level={4} style={{ color: '#fff', marginTop: 0 }}>
              文件信息
            </Title>
            
            <Paragraph style={{ color: '#d1d5db' }}>
              {file.description}
            </Paragraph>
            
            <Divider style={{ borderColor: 'rgba(75, 85, 99, 0.5)' }} />
            
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text><strong>文件名：</strong> {file.originalName}</Text>
              <Text><strong>文件大小：</strong> {file.fileSizeFormatted}</Text>
              <Text><strong>文件类型：</strong> {file.mimeType}</Text>
              <Text><strong>上传时间：</strong> {file.createdAt.toLocaleDateString()}</Text>
              <Text><strong>分类：</strong> {file.category}</Text>
            </Space>
            
            <div style={{ marginTop: 16 }}>
              <Text><strong>标签：</strong></Text>
              <div style={{ marginTop: 8 }}>
                {file.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </div>
            </div>
            
            <ActionButtons>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                size="large"
                onClick={handleDownload}
              >
                下载 ({file.downloadCount})
              </Button>
              <Button 
                icon={<EyeOutlined />}
                size="large"
                onClick={handlePreview}
              >
                预览
              </Button>
              <Button 
                icon={<LikeOutlined />}
                size="large"
                onClick={handleLike}
                danger={liked}
              >
                {likeCount}
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                size="large"
                onClick={handleShare}
              >
                分享
              </Button>
            </ActionButtons>
            
            <UserSection>
              <Avatar 
                size={48} 
                icon={<UserOutlined />} 
                src={file.uploader?.avatar ? getFullImageUrl(file.uploader.avatar) : undefined}
              />
              <div>
                <Text strong style={{ color: '#fff', display: 'block' }}>
                  {file.uploader?.username}
                  {file.uploader?.isVerified && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>已验证</Tag>
                  )}
                </Text>
                <Text type="secondary">
                  <CalendarOutlined /> {file.createdAt.toLocaleDateString()}
                </Text>
              </div>
            </UserSection>
          </FileInfo>
        </FileHeader>
        
        <Card 
          style={{ 
            background: 'rgba(31, 41, 55, 0.5)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '12px'
          }}
        >
          <Title level={4} style={{ color: '#fff' }}>
            文件统计
          </Title>
          <Space size="large">
            <Text><EyeOutlined /> 浏览量: {file.viewCount}</Text>
            <Text><DownloadOutlined /> 下载量: {file.downloadCount}</Text>
            <Text><LikeOutlined /> 点赞数: {likeCount}</Text>
          </Space>
        </Card>
      </motion.div>
    </FileDetailContainer>
  );
};

export default FileDetailPage;
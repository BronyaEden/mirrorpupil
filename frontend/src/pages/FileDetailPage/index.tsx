import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import api, { fileApi } from '../../utils/api';

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
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchFileDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/files/${fileId}`);
        
        if (response.data.success) {
          const fileData = response.data.data.file;
          setFile(fileData);
          setLikeCount(fileData.likeCount);
          // 检查当前用户是否已点赞
          setLiked(fileData.likes.some((like: any) => like.user._id === currentUser?._id));
        } else {
          message.error(response.data.message || '获取文件详情失败');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取文件详情失败:', error);
        message.error('获取文件详情失败');
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFileDetail();
    }
  }, [fileId, currentUser]);

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      const response = await fileApi.get(`/files/${file._id}/download`);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      
      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载文件');
    } catch (error) {
      console.error('下载文件失败:', error);
      message.error('下载文件失败');
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    
    // 如果是图片文件，通过API获取文件数据并在新窗口显示
    if (file.fileType === 'image') {
      try {
        const response = await fileApi.get(`/files/${file._id}/download`);
        
        // 创建对象URL并在新窗口打开
        const url = window.URL.createObjectURL(new Blob([response.data], { type: file.mimeType }));
        window.open(url, '_blank');
        
        // 注意：在生产环境中，可能需要在适当时候调用 URL.revokeObjectURL(url)
      } catch (error) {
        console.error('预览文件失败:', error);
        message.error('预览文件失败');
      }
    } else {
      message.info('预览功能待实现');
    }
  };

  const handleLike = async () => {
    if (!file) return;
    
    try {
      const response = await api.post(`/files/${file._id}/like`);
      
      if (response.data.success) {
        setLiked(response.data.data.isLiked);
        setLikeCount(response.data.data.likeCount);
        message.success(response.data.data.isLiked ? '点赞成功' : '取消点赞');
      } else {
        message.error(response.data.message || '操作失败');
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      message.error('点赞操作失败');
    }
  };

  const handleShare = () => {
    message.info('分享功能待实现');
    // 这里应该实现分享功能
  };

  const handleUserClick = () => {
    if (file?.uploader?._id) {
      navigate(`/profile/${file.uploader._id}`);
    }
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
            {/* 使用API获取缩略图 */}
            {file.fileType === 'image' ? (
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/thumbnail`} 
                alt={file.displayName}
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                onError={(e) => {
                  // 如果缩略图获取失败，显示占位符
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
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
              <Text><strong>上传时间：</strong> {new Date(file.createdAt).toLocaleDateString()}</Text>
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
                icon={liked ? <LikeOutlined /> : <LikeOutlined />}
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
            
            <UserSection onClick={handleUserClick} style={{ cursor: 'pointer' }}>
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
                  <CalendarOutlined /> {new Date(file.createdAt).toLocaleDateString()}
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
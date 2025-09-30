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
  EyeInvisibleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FileItem } from '../../types';
import { getFullImageUrl } from '../../utils/imageUtils';
import api, { fileApi } from '../../utils/api';
import { PreviewModalManager } from '../../components/PreviewModalManager';

const { Title, Text, Paragraph } = Typography;

const FileDetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const FileHeader = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const FilePreview = styled.div`
  flex: 1;
  min-width: 300px;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.65) 0%, rgba(233, 236, 239, 0.65) 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border: 1px solid #ced4da;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 200px;
    border-radius: 8px;
  }
`;

const FileInfo = styled.div`
  flex: 2;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.65) 0%, rgba(233, 236, 239, 0.65) 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ced4da;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  .ant-btn {
    flex: 1;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 16px;
    
    .ant-btn {
      min-width: 0;
      font-size: 0.8rem;
      padding: 4px 8px;
      height: 32px;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 8px;
  margin-top: 16px;
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
    border-radius: 6px;
  }
`;

const BackButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  padding: 6px 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

const FileDetailPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

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
      // 检查用户是否已登录
      const token = localStorage.getItem('accessToken');
      if (!token) {
        message.error('请先登录以下载文件');
        return;
      }
      
      // 使用 XMLHttpRequest 以确保正确处理认证头
      const xhr = new XMLHttpRequest();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      xhr.open('GET', `${apiUrl}/files/${file._id}/download`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.responseType = 'blob';
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          // 创建下载链接
          const url = window.URL.createObjectURL(xhr.response);
          const link = document.createElement('a');
          link.href = url;
          const contentDisposition = xhr.getResponseHeader('Content-Disposition');
          let filename = file.originalName;
          if (contentDisposition) {
            // 尝试从Content-Disposition头中提取文件名
            const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
            if (filenameMatch && filenameMatch[1]) {
              try {
                filename = decodeURIComponent(filenameMatch[1]);
              } catch (e) {
                console.warn('解码文件名失败，使用原始文件名:', e);
                filename = file.originalName;
              }
            } else {
              // 尝试旧的filename格式
              const oldFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
              if (oldFilenameMatch && oldFilenameMatch[1]) {
                try {
                  filename = decodeURIComponent(oldFilenameMatch[1]);
                } catch (e) {
                  console.warn('解码文件名失败，使用原始文件名:', e);
                  filename = file.originalName;
                }
              }
            }
          }
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          
          // 清理
          link.remove();
          window.URL.revokeObjectURL(url);
          
          message.success('开始下载文件');
        } else if (xhr.status === 403) {
          message.error('您没有权限下载此文件');
        } else if (xhr.status === 404) {
          message.error('文件不存在或已被删除');
        } else {
          message.error('下载文件失败');
        }
      };
      
      xhr.onerror = function() {
        message.error('下载文件失败');
      };
      
      xhr.send();
    } catch (error) {
      console.error('下载文件失败:', error);
      message.error('下载文件失败');
    }
  };

  const handlePreview = () => {
    if (!file) return;
    setPreviewVisible(true);
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
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

  const handleBack = () => {
    navigate(-1); // 返回上一页
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
        <BackButton 
          type="primary" 
          onClick={handleBack}
          icon={<ArrowLeftOutlined />}
        >
          返回
        </BackButton>
        
        <Title 
          level={2} 
          style={{ 
            color: '#fff', 
            marginBottom: 32,
            fontSize: '1.5rem'
          }}
        >
          {file.displayName}
        </Title>
        
        <FileHeader>
          <FilePreview>
            {/* 使用API获取缩略图 */}
            {file.fileType === 'image' ? (
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/thumbnail`} 
                alt={file.displayName}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px', 
                  borderRadius: '8px',
                  
                  '@media (max-width: 768px)': {
                    maxHeight: '300px'
                  }
                }}
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
                fontSize: '48px',
                
                '@media (max-width: 768px)': {
                  width: '150px',
                  height: '150px',
                  fontSize: '36px'
                }
              }}>
                <EyeInvisibleOutlined />
              </div>
            )}
            <Text style={{ 
              marginTop: 16, 
              color: '#9ca3af',
              
              '@media (max-width: 768px)': {
                marginTop: 12,
                fontSize: '0.9rem'
              }
            }}>
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
            
            <Space 
              direction="vertical" 
              size="small" 
              style={{ 
                width: '100%',
                '@media (max-width: 768px)': {
                  size: 'small'
                }
              }}
            >
              <Text 
                style={{
                  '@media (max-width: 768px)': {
                    fontSize: '0.9rem'
                  }
                }}
              >
                <strong>文件大小：</strong> {file.fileSizeFormatted}
              </Text>
              <Text 
                style={{
                  '@media (max-width: 768px)': {
                    fontSize: '0.9rem'
                  }
                }}
              >
                <strong>文件类型：</strong> {file.mimeType}
              </Text>
              <Text 
                style={{
                  '@media (max-width: 768px)': {
                    fontSize: '0.9rem'
                  }
                }}
              >
                <strong>上传时间：</strong> {new Date(file.createdAt).toLocaleDateString()}
              </Text>
              <Text 
                style={{
                  '@media (max-width: 768px)': {
                    fontSize: '0.9rem'
                  }
                }}
              >
                <strong>分类：</strong> {file.category}
              </Text>
            </Space>
            
            <div style={{ 
              marginTop: 16,
              '@media (max-width: 768px)': {
                marginTop: 12
              }
            }}>
              <Text><strong>标签：</strong></Text>
              <div style={{ 
                marginTop: 8,
                '@media (max-width: 768px)': {
                  marginTop: 6
                }
              }}>
                {file.tags.map(tag => (
                  <Tag 
                    key={tag} 
                    color="blue"
                    style={{
                      '@media (max-width: 768px)': {
                        fontSize: '0.7rem',
                        padding: '0 4px',
                        height: 'auto',
                        lineHeight: '1.5'
                      }
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
            
            <ActionButtons>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                size="middle"
                onClick={handleDownload}
              >
                下载 ({file.downloadCount})
              </Button>
              <Button 
                icon={<EyeOutlined />}
                size="middle"
                onClick={handlePreview}
              >
                预览
              </Button>
              <Button 
                icon={liked ? <LikeOutlined /> : <LikeOutlined />}
                size="middle"
                onClick={handleLike}
                danger={liked}
              >
                {likeCount}
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                size="middle"
                onClick={handleShare}
              >
                分享
              </Button>
            </ActionButtons>
            
            <PreviewModalManager 
              file={file} 
              visible={previewVisible} 
              onClose={handlePreviewClose} 
            />
            
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
            background: 'linear-gradient(135deg, rgba(102, 125, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(102, 125, 234, 0.2), 0 4px 16px rgba(118, 75, 162, 0.1)',
            
            '@media (max-width: 768px)': {
              borderRadius: '8px',
              padding: '16px'
            }
          }}
        >
          <Title 
            level={4} 
            style={{ 
              color: '#fff',
              
              '@media (max-width: 768px)': {
                fontSize: '1.1rem'
              }
            }}
          >
            文件统计
          </Title>
          <Space 
            size="large"
            style={{
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px'
              }
            }}
          >
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
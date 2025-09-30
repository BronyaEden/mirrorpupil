import React, { useEffect, useRef, useState } from 'react';
import { Card, Tag, Avatar, Space, Button, Dropdown, Typography, Image, Spin } from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined, 
  HeartOutlined, 
  ShareAltOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  HeartFilled
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FileItem } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate } from 'react-router-dom';
import { useViewport } from '../../hooks/useResponsive';
import { mediaQuery } from '../../styles/responsive';
import api from '../../utils/api';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface FileCardProps {
  file: FileItem;
  onDownload?: (file: FileItem) => void;
  onLike?: (file: FileItem) => void;
  onShare?: (file: FileItem) => void;
  onEdit?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  onPreview?: (file: FileItem) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

// 添加一个函数来获取头像URL
const getAvatarUrl = (file: FileItem) => {
  // 首先检查file.uploader是否存在且有avatar字段
  if (file.uploader?.avatar) {
    // 如果avatar是ObjectId格式，则构建图片API URL
    if (/^[0-9a-fA-F]{24}$/.test(file.uploader.avatar)) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/images/${file.uploader.avatar}`;
    }
    // 如果已经是完整URL，则直接返回
    return file.uploader.avatar;
  }
  

  
  // 如果没有头像，返回null
  return null;
};

const StyledCard = styled(motion(Card))`
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.65) 0%, rgba(233, 236, 239, 0.65) 100%);
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  width: 100%; /* 确保卡片占满容器宽度 */
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.colors.primary.main};
  }
  
  .ant-card-body {
    padding: ${props => props.theme.spacing.sm};
  }
  
  .ant-card-meta-title {
    color: #212529;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .ant-card-meta-description {
    color: #495057;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    border-radius: ${props => props.theme.borderRadius.sm};
    margin-bottom: 8px;
    
    .ant-card-body {
      padding: ${props => props.theme.spacing.xs};
    }
    
    .ant-card-meta-title {
      font-size: 0.8rem;
    }
    
    .ant-card-meta-description {
      font-size: 0.7rem;
    }
  }
  
  @media (max-width: 480px) {
    .ant-card-meta-title {
      font-size: 0.75rem;
    }
    
    .ant-card-meta-description {
      font-size: 0.65rem;
    }
  }
`;

const FilePreview = styled.div<{ fileType: string }>`
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, rgba(241, 243, 245, 0.65) 0%, rgba(233, 236, 239, 0.65) 100%);
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      rgba(0, 217, 255, 0.1) 0%, 
      rgba(255, 215, 0, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    height: 120px;
    border-radius: ${props => props.theme.borderRadius.xs};
    margin-bottom: ${props => props.theme.spacing.xs};
  }
  
  @media (max-width: 480px) {
    height: 100px;
  }
`;

const FileTypeIcon = styled.div<{ fileType: string }>`
  font-size: 2rem;
  color: ${props => {
    switch (props.fileType) {
      case 'image': return '#52c41a';
      case 'video': return '#1890ff';
      case 'audio': return '#722ed1';
      case 'document': return '#fa8c16';
      default: return props.theme.colors.neutral.gray500;
    }
  }};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const FileInfo = styled.div`
  margin-top: ${props => props.theme.spacing.xs};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-top: ${props => props.theme.spacing.xxs};
  }
`;

const FileStats = styled(Space)`
  color: #6c757d;
  font-size: 0.75rem;
  
  .anticon {
    margin-right: 2px;
    font-size: 0.75rem;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 0.7rem;
    
    .anticon {
      font-size: 0.7rem;
      margin-right: 1px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
    
    .anticon {
      font-size: 0.65rem;
    }
  }
`;

const ActionButtons = styled(Space)`
  margin-top: ${props => props.theme.spacing.sm};
  width: 100%;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    margin-top: ${props => props.theme.spacing.xxs};
    gap: 2px;
  }
`;

const TagContainer = styled.div`
  margin: ${props => props.theme.spacing.xs} 0;
  
  .ant-tag {
    margin-bottom: 2px;
    background: rgba(0, 123, 255, 0.1);
    border-color: #007bff;
    color: #007bff;
    font-size: 0.65rem;
    padding: 1px 4px;
    line-height: 1.2;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin: ${props => props.theme.spacing.xxs} 0;
    
    .ant-tag {
      font-size: 0.6rem;
      padding: 1px 3px;
      margin-bottom: 1px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-tag {
      font-size: 0.55rem;
      padding: 1px 2px;
    }
  }
`;

const CompactFileInfo = styled.div`
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    .ant-typography {
      font-size: 0.7rem;
    }
    
    .ant-typography-secondary {
      font-size: 0.65rem;
    }
  }
  
  @media (max-width: 480px) {
    .ant-typography {
      font-size: 0.65rem;
    }
    
    .ant-typography-secondary {
      font-size: 0.6rem;
    }
  }
`;

const CompactFileStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.xs};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-top: ${props => props.theme.spacing.xxs};
    font-size: 0.7rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
  }
`;

const CompactStats = styled(Space)`
  color: #6c757d;
  font-size: 0.75rem;
  
  .anticon {
    margin-right: 2px;
    font-size: 0.75rem;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 0.7rem;
    
    .anticon {
      font-size: 0.7rem;
      margin-right: 1px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
    
    .anticon {
      font-size: 0.65rem;
    }
  }
`;

const CompactActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.xs};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-top: ${props => props.theme.spacing.xxs};
  }
`;

const CompactButton = styled(Button)`
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 0.7rem;
    padding: 0 6px;
    height: 28px;
    
    .anticon {
      font-size: 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
    padding: 0 4px;
    height: 24px;
    
    .anticon {
      font-size: 0.7rem;
    }
  }
`;

const FileCard: React.FC<FileCardProps> = ({
  file,
  onDownload,
  onLike,
  onShare,
  onEdit,
  onDelete,
  onPreview,
  showActions = true,
  isOwner = false
}) => {
  const navigate = useNavigate();
  const { isMobile } = useViewport();
  const cardRef = useRef<HTMLDivElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState<boolean>(true);

  // 获取缩略图URL
  useEffect(() => {
    const fetchThumbnail = async () => {
      if (file.fileType === 'image') {
        try {
          setIsLoadingThumbnail(true);
          // 延迟加载缩略图，优先显示基础信息
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 构建缩略图URL
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          setThumbnailUrl(`${baseUrl}/files/${file._id}/thumbnail`);
        } catch (error) {
          console.error('获取缩略图失败:', error);
          setThumbnailUrl(null);
        } finally {
          setIsLoadingThumbnail(false);
        }
      } else {
        setIsLoadingThumbnail(false);
      }
    };

    fetchThumbnail();
  }, [file._id, file.fileType]);

  const getFileTypeIcon = (fileType: string) => {
    const icons = {
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      document: '📄',
      other: '📁'
    };
    return icons[fileType as keyof typeof icons] || icons.other;
  };

  const handlePreview = () => {
    // 导航到文件详情页面
    navigate(`/files/${file._id}`);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(file);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(file);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(file);
    }
  };



  const menuItems = [
    ...(isOwner ? [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => onEdit && onEdit(file)
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => onDelete && onDelete(file)
      }
    ] : []),
    {
      key: 'share',
      icon: <ShareAltOutlined />,
      label: '分享',
      onClick: () => onShare && onShare(file)
    }
  ];

  return (
    <div ref={cardRef}>
      <StyledCard
        hoverable
        onClick={handlePreview}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        size="small"
      >
        <FilePreview fileType={file.fileType}>
          {file.fileType === 'image' && thumbnailUrl ? (
            // 使用API获取缩略图
            <Image
              src={thumbnailUrl}
              alt={file.displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              preview={false}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+SW1hZ2U8L3RleHQ+PC9zdmc+"
              placeholder={
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(241, 243, 245, 0.65) 0%, rgba(233, 236, 239, 0.65) 100%)'
                }}>
                  <Spin size="small" />
                </div>
              }
            />
          ) : (
            <FileTypeIcon fileType={file.fileType}>
              {getFileTypeIcon(file.fileType)}
            </FileTypeIcon>
          )}
        </FilePreview>

        <Meta
          title={
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text ellipsis style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {file.displayName}
              </Text>
              <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                {file.fileSizeFormatted} • {file.mimeType}
              </Text>
            </Space>
          }
          description={
            <CompactFileInfo>
              {file.description && (
                <Paragraph 
                  ellipsis={{ rows: 2 }} 
                  style={{ 
                    color: '#6c757d', 
                    fontSize: '0.7rem',
                    marginBottom: 4 
                  }}
                >
                  {file.description}
                </Paragraph>
              )}
              
              {file.tags.length > 0 && (
                <TagContainer>
                  {file.tags.slice(0, 3).map(tag => (
                    <Tag key={tag}>
                      {tag}
                    </Tag>
                  ))}
                  {file.tags.length > 3 && (
                    <Tag>+{file.tags.length - 3}</Tag>
                  )}
                </TagContainer>
              )}
              
              <Space 
                split="•" 
                style={{ 
                  width: '100%', 
                  fontSize: '0.7rem', 
                  color: '#6c757d',
                  flexWrap: 'wrap'
                }}
              >
                <Space size={2}>
                  <Avatar 
                    size={isMobile ? 16 : 20} 
                    src={getAvatarUrl(file)}
                  >
                    {(file.uploader?.username || file.uploaderId)?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Text type="secondary" style={{ fontSize: isMobile ? '0.6rem' : '0.65rem' }}>
                    {file.uploader?.username || '未知用户'}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: isMobile ? '0.6rem' : '0.65rem' }}>
                  {dayjs(file.createdAt).fromNow()}
                </Text>
              </Space>
              
              <CompactFileStats>
                <CompactStats size={2}>
                  <span><EyeOutlined />{file.viewCount}</span>
                  <span><DownloadOutlined />{file.downloadCount}</span>
                  <span>
                    {file.likeCount > 0 ? <HeartFilled /> : <HeartOutlined />}
                    {file.likeCount}
                  </span>
                </CompactStats>
              </CompactFileStats>
            </CompactFileInfo>
          }
        />

        {showActions && (
          <CompactActionButtons>
            <CompactButton 
              type="primary" 
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              下载
            </CompactButton>
            
            <Space size={2}>
              <CompactButton
                size="small"
                icon={file.likeCount > 0 ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleLike}
                style={{
                  color: file.likeCount > 0 ? '#ff4d4f' : undefined,
                }}
              />
              
              {menuItems.length > 0 && (
                <Dropdown
                  menu={{ items: menuItems }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <CompactButton 
                    size="small" 
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              )}
            </Space>
          </CompactActionButtons>
        )}
      </StyledCard>
    </div>
  );
};

export default FileCard;
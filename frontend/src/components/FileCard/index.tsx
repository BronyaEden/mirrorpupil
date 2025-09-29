import React from 'react';
import { Card, Tag, Avatar, Space, Button, Dropdown, Typography, Image } from 'antd';
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
import { getFullImageUrl } from '../../utils/imageUtils';

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

const StyledCard = styled(motion(Card))`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.glow};
    border-color: ${props => props.theme.colors.primary.main};
  }
  
  .ant-card-body {
    padding: ${props => props.theme.spacing.sm};
  }
  
  .ant-card-meta-title {
    color: ${props => props.theme.colors.text.primary};
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .ant-card-meta-description {
    color: ${props => props.theme.colors.text.secondary};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    border-radius: ${props => props.theme.borderRadius.sm};
    
    .ant-card-body {
      padding: ${props => props.theme.spacing.xs};
    }
  }
`;

const FilePreview = styled.div<{ fileType: string }>`
  width: 100%;
  height: 150px;
  background: ${props => props.theme.colors.background.surface};
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
`;

const FileInfo = styled.div`
  margin-top: ${props => props.theme.spacing.xs};
`;

const FileStats = styled(Space)`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.75rem;
  
  .anticon {
    margin-right: 2px;
    font-size: 0.75rem;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 0.7rem;
    
    .anticon {
      font-size: 0.7rem;
    }
  }
`;

const ActionButtons = styled(Space)`
  margin-top: ${props => props.theme.spacing.sm};
  width: 100%;
  justify-content: space-between;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-top: ${props => props.theme.spacing.xs};
  }
`;

const TagContainer = styled.div`
  margin: ${props => props.theme.spacing.xs} 0;
  
  .ant-tag {
    margin-bottom: 2px;
    background: rgba(0, 217, 255, 0.1);
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
    font-size: 0.65rem;
    padding: 1px 4px;
    line-height: 1.2;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin: ${props => props.theme.spacing.xxs} 0;
    
    .ant-tag {
      font-size: 0.6rem;
      padding: 1px 3px;
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
        {file.fileType === 'image' ? (
          // 使用API获取缩略图
          <Image
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/thumbnail`}
            alt={file.displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            preview={false}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+SW1hZ2U8L3RleHQ+PC9zdmc+"
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
          <FileInfo>
            {file.description && (
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                style={{ 
                  color: '#B0BEC5', 
                  fontSize: '0.8rem',
                  marginBottom: 6 
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
            
            <Space split="•" style={{ width: '100%', fontSize: '0.7rem', color: '#78909C' }}>
              <Space size={2}>
                <Avatar size={14} src={file.uploader?.avatar}>
                  {file.uploader?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Text type="secondary" style={{ fontSize: '0.7rem' }}>
                  {file.uploader?.username}
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: '0.7rem' }}>
                {dayjs(file.createdAt).fromNow()}
              </Text>
            </Space>
            
            <FileStats size={2}>
              <span><EyeOutlined />{file.viewCount}</span>
              <span><DownloadOutlined />{file.downloadCount}</span>
              <span>
                {file.likeCount > 0 ? <HeartFilled /> : <HeartOutlined />}
                {file.likeCount}
              </span>
            </FileStats>
          </FileInfo>
        }
      />

      {showActions && (
        <ActionButtons size={2}>
          <Button 
            type="primary" 
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            style={{ fontSize: '12px', padding: '0 8px' }}
          >
            下载
          </Button>
          
          <Space size={2}>
            <Button
              size="small"
              icon={file.likeCount > 0 ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleLike}
              style={{
                color: file.likeCount > 0 ? '#ff4d4f' : undefined,
                fontSize: '12px',
                padding: '0 6px'
              }}
            />
            
            {menuItems.length > 0 && (
              <Dropdown
                menu={{ items: menuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button 
                  size="small" 
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: '12px', padding: '0 6px' }}
                />
              </Dropdown>
            )}
          </Space>
        </ActionButtons>
      )}
    </StyledCard>
  );
};

export default FileCard;
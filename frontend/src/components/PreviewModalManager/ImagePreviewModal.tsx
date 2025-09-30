import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import styled from 'styled-components';
import { FileItem } from '../../types';
import { mediaQuery } from '../../styles/responsive';

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 24px;
  position: relative;
  
  ${mediaQuery.mobile(`
    min-height: 300px;
    padding: 16px;
  `)}
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  object-fit: contain;
  
  ${mediaQuery.mobile(`
    max-height: 60vh;
  `)}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
`;

interface ImagePreviewModalProps {
  file: FileItem;
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  file,
  visible,
  onClose,
  loading,
  onLoadingChange
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (visible && file) {
      loadImage();
    }
    
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [visible, file]);
  
  const loadImage = async () => {
    try {
      onLoadingChange(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        message.error('请先登录以预览文件');
        onClose();
        return;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } else if (response.status === 403) {
        message.error('您没有权限预览此文件');
        onClose();
      } else if (response.status === 404) {
        message.error('文件不存在或已被删除');
        onClose();
      } else {
        message.error('预览文件失败');
        onClose();
      }
    } catch (error) {
      console.error('预览文件失败:', error);
      message.error('预览文件失败');
      onClose();
    } finally {
      onLoadingChange(false);
    }
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="加载中..." />
      </LoadingContainer>
    );
  }
  
  return (
    <ImageContainer>
      {imageUrl && (
        <StyledImage 
          src={imageUrl} 
          alt={file.displayName}
          onLoad={() => {
            // 图片加载完成后的处理
          }}
          onError={() => {
            message.error('图片加载失败');
            onClose();
          }}
        />
      )}
    </ImageContainer>
  );
};
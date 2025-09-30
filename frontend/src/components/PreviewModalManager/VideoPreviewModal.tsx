import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import styled from 'styled-components';
import { FileItem } from '../../types';
import { mediaQuery } from '../../styles/responsive';

const VideoContainer = styled.div`
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

const StyledVideo = styled.video`
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  ${mediaQuery.mobile(`
    max-height: 60vh;
  `)}
  
  &:focus {
    outline: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
`;

interface VideoPreviewModalProps {
  file: FileItem;
  visible: boolean;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  file,
  visible,
  onClose
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible && file) {
      loadVideo();
    }
    
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [visible, file]);
  
  const loadVideo = async () => {
    try {
      setLoading(true);
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
        setVideoUrl(url);
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
      setLoading(false);
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
    <VideoContainer>
      {videoUrl && (
        <StyledVideo 
          src={videoUrl} 
          controls
          autoPlay
          onLoadStart={() => {
            // 视频开始加载
          }}
          onLoadedData={() => {
            // 视频数据加载完成
          }}
          onError={() => {
            message.error('视频加载失败');
            onClose();
          }}
        />
      )}
    </VideoContainer>
  );
};
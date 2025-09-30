import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import styled from 'styled-components';
import { FileItem } from '../../types';
import { mediaQuery } from '../../styles/responsive';

const AudioContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 24px;
  position: relative;
  
  ${mediaQuery.mobile(`
    min-height: 250px;
    padding: 16px;
  `)}
`;

const StyledAudio = styled.audio`
  width: 100%;
  max-width: 500px;
  
  ${mediaQuery.mobile(`
    max-width: 100%;
  `)}
  
  &:focus {
    outline: none;
  }
`;

const FileInfo = styled.div`
  margin-top: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 1.2rem;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.65);
  }
  
  ${mediaQuery.mobile(`
    margin-top: 16px;
    
    h3 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.8rem;
    }
  `)}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
`;

interface AudioPreviewModalProps {
  file: FileItem;
  visible: boolean;
  onClose: () => void;
}

export const AudioPreviewModal: React.FC<AudioPreviewModalProps> = ({
  file,
  visible,
  onClose
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible && file) {
      loadAudio();
    }
    
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [visible, file]);
  
  const loadAudio = async () => {
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
        setAudioUrl(url);
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
    <AudioContainer>
      {audioUrl && (
        <>
          <StyledAudio 
            src={audioUrl} 
            controls
            autoPlay
            onLoadStart={() => {
              // 音频开始加载
            }}
            onLoadedData={() => {
              // 音频数据加载完成
            }}
            onError={() => {
              message.error('音频加载失败');
              onClose();
            }}
          />
          <FileInfo>
            <h3>{file.displayName}</h3>
            <p>{file.originalName}</p>
            <p>{file.fileSizeFormatted}</p>
          </FileInfo>
        </>
      )}
    </AudioContainer>
  );
};
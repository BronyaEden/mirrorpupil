import React, { useState, useEffect } from 'react';
import { Spin, message, Typography } from 'antd';
import styled from 'styled-components';
import { FileItem } from '../../types';
import { mediaQuery } from '../../styles/responsive';

const { Text, Title } = Typography;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
  padding: 24px;
  position: relative;
  
  ${mediaQuery.mobile(`
    min-height: 300px;
    padding: 16px;
  `)}
`;

const TextContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 70vh;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  ${mediaQuery.mobile(`
    max-height: 60vh;
    font-size: 12px;
    padding: 12px;
  `)}
  
  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 217, 255, 0.5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 217, 255, 0.8);
  }
`;

const FileInfo = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  ${mediaQuery.mobile(`
    margin-bottom: 16px;
    padding-bottom: 12px;
  `)}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
`;

interface TextPreviewModalProps {
  file: FileItem;
  visible: boolean;
  onClose: () => void;
}

export const TextPreviewModal: React.FC<TextPreviewModalProps> = ({
  file,
  visible,
  onClose
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible && file) {
      loadTextContent();
    }
  }, [visible, file]);
  
  const loadTextContent = async () => {
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
        const text = await response.text();
        setTextContent(text);
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
    <TextContainer>
      <FileInfo>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          {file.displayName}
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem' }}>
          {file.originalName} • {file.fileSizeFormatted}
        </Text>
      </FileInfo>
      
      {textContent !== null ? (
        <TextContent>{textContent}</TextContent>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255, 255, 255, 0.65)' }}>
          无法加载文件内容
        </div>
      )}
    </TextContainer>
  );
};
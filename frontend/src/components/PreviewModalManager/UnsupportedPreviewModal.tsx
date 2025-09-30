import React from 'react';
import { Button, Result } from 'antd';
import { FileItem } from '../../types';
import styled from 'styled-components';
import { mediaQuery } from '../../styles/responsive';

const StyledResult = styled(Result)`
  padding: 24px;
  
  .ant-result-icon {
    margin-bottom: 16px;
  }
  
  .ant-result-title {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
  
  .ant-result-subtitle {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.9rem;
  }
  
  ${mediaQuery.mobile(`
    padding: 16px;
    
    .ant-result-title {
      font-size: 1.1rem;
    }
    
    .ant-result-subtitle {
      font-size: 0.8rem;
    }
  `)}
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  
  ${mediaQuery.mobile(`
    flex-direction: column;
    gap: 8px;
    
    .ant-btn {
      width: 100%;
    }
  `)}
`;

interface UnsupportedPreviewModalProps {
  file: FileItem;
  visible: boolean;
  onClose: () => void;
}

export const UnsupportedPreviewModal: React.FC<UnsupportedPreviewModalProps> = ({
  file,
  onClose
}) => {
  const handleDownload = () => {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/download`;
    link.setAttribute('download', file.originalName);
    document.body.appendChild(link);
    link.click();
    
    // 清理
    link.remove();
  };
  
  return (
    <StyledResult
      status="info"
      title="该文件类型不支持预览"
      subTitle={`文件 "${file.displayName}" 无法在浏览器中直接预览，您可以下载后在本地查看。`}
      extra={
        <ActionContainer>
          <Button type="primary" onClick={handleDownload}>
            下载文件
          </Button>
          <Button onClick={onClose}>
            关闭
          </Button>
        </ActionContainer>
      }
    />
  );
};
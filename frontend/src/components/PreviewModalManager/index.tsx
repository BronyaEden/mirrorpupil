import React, { useState } from 'react';
import { Modal } from 'antd';
import styled from 'styled-components';
import { FileItem } from '../../types';
import { ImagePreviewModal } from './ImagePreviewModal';
import { VideoPreviewModal } from './VideoPreviewModal';
import { AudioPreviewModal } from './AudioPreviewModal';
import { TextPreviewModal } from './TextPreviewModal';
import { UnsupportedPreviewModal } from './UnsupportedPreviewModal';
import { mediaQuery } from '../../styles/responsive';

interface PreviewModalManagerProps {
  file: FileItem | null;
  visible: boolean;
  onClose: () => void;
}

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: rgba(31, 41, 55, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 217, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 217, 255, 0.2), 0 4px 16px rgba(255, 215, 0, 0.1);
    
    ${mediaQuery.mobile(`
      border-radius: 8px;
      margin: 16px;
    `)}
  }
  
  .ant-modal-close {
    color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      color: #00d9ff;
    }
  }
  
  .ant-modal-header {
    background: transparent;
    border-bottom: 1px solid rgba(75, 85, 99, 0.5);
    padding: 16px 24px;
    
    ${mediaQuery.mobile(`
      padding: 12px 16px;
    `)}
  }
  
  .ant-modal-title {
    color: #fff;
    font-weight: 600;
    
    ${mediaQuery.mobile(`
      font-size: 1.1rem;
    `)}
  }
  
  .ant-modal-body {
    padding: 0;
  }
  
  ${mediaQuery.mobile(`
    margin: 16px;
    width: calc(100% - 32px) !important;
    max-width: calc(100% - 32px);
  `)}
`;

export const PreviewModalManager: React.FC<PreviewModalManagerProps> = ({
  file,
  visible,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  
  if (!file) return null;
  
  const renderPreviewModal = () => {
    switch (file.fileType) {
      case 'image':
        return (
          <ImagePreviewModal 
            file={file} 
            visible={visible} 
            onClose={onClose} 
            loading={loading}
            onLoadingChange={setLoading}
          />
        );
      case 'video':
        return (
          <VideoPreviewModal 
            file={file} 
            visible={visible} 
            onClose={onClose} 
          />
        );
      case 'audio':
        return (
          <AudioPreviewModal 
            file={file} 
            visible={visible} 
            onClose={onClose} 
          />
        );
      case 'document':
        return (
          <TextPreviewModal 
            file={file} 
            visible={visible} 
            onClose={onClose} 
          />
        );
      default:
        return (
          <UnsupportedPreviewModal 
            file={file} 
            visible={visible} 
            onClose={onClose} 
          />
        );
    }
  };
  
  return (
    <StyledModal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={file.fileType === 'image' ? '90%' : 600}
      centered
      destroyOnClose
    >
      {renderPreviewModal()}
    </StyledModal>
  );
};
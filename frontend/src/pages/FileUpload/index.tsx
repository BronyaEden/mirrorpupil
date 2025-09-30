import React, { useState } from 'react';
import { 
  Upload, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Progress,
  Modal,
  message
} from 'antd';
import { 
  InboxOutlined, 
  PlusOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../../utils/api/index.ts';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

interface FileUploadForm {
  displayName: string;
  description?: string;
  category?: string;
  tags: string[];
  isPublic: boolean;
  accessLevel: 'public' | 'private' | 'friends' | 'link';
}

const UploadContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
    
    .ant-form-item {
      margin-bottom: 12px;
    }
    
    .ant-typography {
      font-size: 16px;
    }
    
    .ant-form-item-label {
      padding-bottom: 4px;
    }
    
    .access-control-item .ant-space {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    
    .access-control-item .ant-typography {
      font-size: 12px;
    }
    
    .ant-typography-title {
      font-size: 20px !important;
      margin-bottom: 24px !important;
    }
  }
`;

const StyledCard = styled(Card)`
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.65) 0%, rgba(233, 236, 239, 0.65) 100%);
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.lg};
  
  .ant-card-body {
    padding: ${props => props.theme.spacing.xl};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    .ant-card-body {
      padding: ${props => props.theme.spacing.md};
    }
  }
`;

const StyledDragger = styled(Dragger)`
  background: ${props => props.theme.colors.background.surface} !important;
  border: 2px dashed ${props => props.theme.colors.primary.main} !important;
  border-radius: ${props => props.theme.borderRadius.lg} !important;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary.light} !important;
    background: rgba(0, 217, 255, 0.05) !important;
  }
  
  .ant-upload-drag-icon {
    color: ${props => props.theme.colors.primary.main} !important;
  }
  
  .ant-upload-text {
    color: #00D9FF !important;
    font-size: 20px !important;
    font-weight: 500 !important;
  }
  
  .ant-upload-hint {
    color: #00D9FF !important;
    font-size: 16px !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    .ant-upload-text {
      font-size: 16px !important;
    }
    
    .ant-upload-hint {
      font-size: 14px !important;
    }
    
    .ant-upload-drag-icon .anticon {
      font-size: 32px !important;
    }
  }
`;

const TagInput = styled.div`
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  background: #ffffff;
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  
  .ant-tag {
    margin: 0;
    background: ${props => props.theme.colors.primary.main};
    border-color: ${props => props.theme.colors.primary.main};
    color: white;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.xs};
    min-height: 32px;
  }
`;

const TagInputField = styled(Input)`
  border: none;
  background: transparent;
  flex: 1;
  min-width: 120px;
  
  &:focus {
    box-shadow: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    min-width: 80px;
    font-size: 14px;
  }
`;

const StyledFormItemLabel = styled.span`
  color: #212529 !important;
  font-size: 18px !important;
  font-weight: 500 !important;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 14px !important;
  }
`;

const StyledInput = styled(Input)`
  &::placeholder {
    color: #6c757d !important;
    font-size: 16px !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    &::placeholder {
      font-size: 14px !important;
    }
    
    font-size: 14px;
  }
`;

const StyledTextArea = styled(TextArea)`
  &::placeholder {
    color: #6c757d !important;
    font-size: 16px !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    &::placeholder {
      font-size: 14px !important;
    }
    
    font-size: 14px;
  }
`;

const StyledSelect = styled(Select)`
  .ant-select-selection-placeholder {
    color: #6c757d !important;
    font-size: 16px !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    .ant-select-selection-placeholder {
      font-size: 14px !important;
    }
    
    font-size: 14px;
  }
`;

const StyledButton = styled(Button)`
  height: 48px !important;
  font-size: 1.1rem !important;
  background: linear-gradient(45deg, #00D9FF, #00A3FF, #0066FF) !important;
  border: none !important;
  
  &:hover, &:focus {
    background: linear-gradient(45deg, #00A3FF, #0066FF, #0033CC) !important;
    border: none !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    height: 40px !important;
    font-size: 1rem !important;
  }
`;

// 支持的文件类型列表
const SUPPORTED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/tiff', 'image/bmp',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  'application/json', 'application/xml'
];

// 文件类型显示名称映射
const FILE_TYPE_NAMES: Record<string, string> = {
  'image/jpeg': 'JPEG 图片',
  'image/png': 'PNG 图片',
  'image/gif': 'GIF 图片',
  'image/webp': 'WebP 图片',
  'image/svg+xml': 'SVG 图片',
  'image/tiff': 'TIFF 图片',
  'image/bmp': 'BMP 图片',
  'video/mp4': 'MP4 视频',
  'video/webm': 'WebM 视频',
  'video/quicktime': 'MOV 视频',
  'video/x-msvideo': 'AVI 视频',
  'audio/mp3': 'MP3 音频',
  'audio/wav': 'WAV 音频',
  'audio/ogg': 'OGG 音频',
  'audio/aac': 'AAC 音频',
  'application/pdf': 'PDF 文档',
  'text/plain': '文本文件',
  'text/csv': 'CSV 文件',
  'application/msword': 'Word 文档',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word 文档',
  'application/vnd.ms-excel': 'Excel 表格',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel 表格',
  'application/vnd.ms-powerpoint': 'PowerPoint 演示文稿',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint 演示文稿',
  'application/zip': 'ZIP 压缩文件',
  'application/x-rar-compressed': 'RAR 压缩文件',
  'application/x-7z-compressed': '7Z 压缩文件',
  'application/json': 'JSON 文件',
  'application/xml': 'XML 文件'
};

const FileUpload: React.FC = () => {
  const [form] = Form.useForm<FileUploadForm>();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleUpload = async (values: FileUploadForm) => {
    if (!uploadFile) {
      message.error('请选择要上传的文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('displayName', values.displayName || uploadFile.name);
      if (values.description) formData.append('description', values.description);
      if (values.category) formData.append('category', values.category);
      formData.append('tags', JSON.stringify(tags));
      formData.append('isPublic', values.isPublic.toString());
      formData.append('accessLevel', values.accessLevel);

      // 使用真实的API上传文件
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      if (response.data.success) {
        // 显示自定义成功弹窗
        setShowSuccessModal(true);
        
        // 一秒后自动关闭弹窗
        setTimeout(() => {
          setShowSuccessModal(false);
          
          // 重置表单
          form.resetFields();
          setUploadFile(null);
          setTags([]);
          setTagInput('');
          setUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(response.data.message || '上传失败');
      }

    } catch (error: any) {
      console.error('文件上传失败:', error);
      message.error(error.response?.data?.message || '文件上传失败');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (file: File) => {
    // 检查文件类型是否支持
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      const fileTypeName = FILE_TYPE_NAMES[file.type] || file.type;
      message.error(`不支持的文件类型: ${fileTypeName || '未知类型'}。请选择支持的文件类型进行上传。`);
      return false;
    }

    setUploadFile(file);
    
    // 自动填充显示名称
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    form.setFieldValue('displayName', nameWithoutExt);
    
    return false; // 阻止自动上传
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <UploadContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title 
          level={2} 
          style={{ 
            color: '#fff', 
            textAlign: 'center', 
            marginBottom: 32,
            fontSize: '24px'
          }}
        >
          文件上传
        </Typography.Title>
        
        <StyledCard>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpload}
            initialValues={{
              isPublic: true,
              accessLevel: 'public'
            }}
          >
            {/* 文件选择区域 */}
            <Form.Item label={<StyledFormItemLabel>选择文件</StyledFormItemLabel>}>
              <StyledDragger
                beforeUpload={handleFileSelect}
                showUploadList={false}
                disabled={uploading}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48 }} />
                </p>
                <p className="ant-upload-text">
                  点击或拖拽文件到此区域上传
                </p>
                <p className="ant-upload-hint">
                  支持单个文件上传，最大支持2GB
                </p>
              </StyledDragger>
              
              {uploadFile && (
                <div style={{ 
                  marginTop: 16, 
                  padding: 16, 
                  background: 'rgba(0, 217, 255, 0.1)', 
                  borderRadius: 8 
                }}>
                  <Typography.Text strong style={{ 
                    color: '#00D9FF',
                    display: 'block',
                    marginBottom: 8
                  }}>
                    已选择文件：
                  </Typography.Text>
                  <Typography.Text style={{ 
                    color: '#fff',
                    wordBreak: 'break-all'
                  }}>
                    {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography.Text>
                </div>
              )}
            </Form.Item>

            {/* 上传进度 */}
            {uploading && (
              <Form.Item>
                <Progress 
                  percent={uploadProgress} 
                  status={uploadProgress === 100 ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#00D9FF',
                    '100%': '#FFD700',
                  }}
                />
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: 8,
                  fontSize: '14px',
                  color: '#00D9FF'
                }}>
                  上传进度: {uploadProgress}%
                </div>
              </Form.Item>
            )}

            {/* 文件信息 */}
            <Form.Item
              name="displayName"
              label={<StyledFormItemLabel>文件名称</StyledFormItemLabel>}
              rules={[{ required: true, message: '请输入文件名称' }]}
            >
              <StyledInput />
            </Form.Item>

            <Form.Item
              name="description"
              label={<StyledFormItemLabel>文件描述</StyledFormItemLabel>}
            >
              <StyledTextArea 
                rows={3} 
                placeholder="简单描述这个文件..." 
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={<StyledFormItemLabel>文件分类</StyledFormItemLabel>}
            >
              <StyledSelect placeholder="选择分类">
                <Option value="工作文档">工作文档</Option>
                <Option value="学习资料">学习资料</Option>
                <Option value="图片素材">图片素材</Option>
                <Option value="视频内容">视频内容</Option>
                <Option value="音频文件">音频文件</Option>
                <Option value="软件工具">软件工具</Option>
                <Option value="其他">其他</Option>
              </StyledSelect>
            </Form.Item>

            {/* 标签输入 */}
            <Form.Item label={<StyledFormItemLabel>文件标签</StyledFormItemLabel>}>
              <TagInput>
                {tags.map(tag => (
                  <Tag 
                    key={tag} 
                    closable 
                    onClose={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
                <TagInputField
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  onBlur={handleAddTag}
                  placeholder="输入标签，按回车添加"
                  size="small"
                />
              </TagInput>
              <Typography.Text type="secondary" style={{ fontSize: '0.85rem', marginTop: 4, display: 'block' }}>
                添加相关标签，便于其他用户搜索和发现
              </Typography.Text>
            </Form.Item>

            {/* 访问权限设置 */}
            <Form.Item
              name="isPublic"
              valuePropName="checked"
              className="access-control-item"
            >
              <Space>
                <Switch />
                <Typography.Text style={{ color: '#fff' }}>公开文件</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: '0.85rem' }}>
                  （关闭后文件将不会在公开列表中显示）
                </Typography.Text>
              </Space>
            </Form.Item>
            
            <Form.Item
              name="accessLevel"
              label={<StyledFormItemLabel>访问权限</StyledFormItemLabel>}
            >
              <StyledSelect>
                <Option value="public">所有人可访问</Option>
                <Option value="friends">仅好友可访问</Option>
                <Option value="link">仅通过链接访问</Option>
                <Option value="private">仅自己可访问</Option>
              </StyledSelect>
            </Form.Item>

            {/* 提交按钮 */}
            <Form.Item>
              <StyledButton 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={uploading}
                disabled={!uploadFile}
                block
              >
                {uploading ? '上传中...' : '开始上传'}
              </StyledButton>
            </Form.Item>
          </Form>
        </StyledCard>
      </motion.div>
      
      {/* 自定义成功弹窗 */}
      <Modal
        open={showSuccessModal}
        footer={null}
        closable={false}
        centered
        width={300}
      >
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          fontSize: '18px',
          color: '#00D9FF'
        }}>
          上传成功
        </div>
      </Modal>
    </UploadContainer>
  );
};

export default FileUpload;
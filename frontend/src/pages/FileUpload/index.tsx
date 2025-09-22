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
  message
} from 'antd';
import { 
  InboxOutlined, 
  PlusOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
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
`;

const StyledCard = styled(Card)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.lg};
  
  .ant-card-body {
    padding: ${props => props.theme.spacing.xl};
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
    color: ${props => props.theme.colors.text.primary} !important;
  }
  
  .ant-upload-hint {
    color: ${props => props.theme.colors.text.secondary} !important;
  }
`;

const TagInput = styled.div`
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.secondary};
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
`;

const TagInputField = styled(Input)`
  border: none;
  background: transparent;
  flex: 1;
  min-width: 120px;
  
  &:focus {
    box-shadow: none;
  }
`;

const FileUpload: React.FC = () => {
  const [form] = Form.useForm<FileUploadForm>();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      // 这里应该调用实际的上传API
      // const response = await fileAPI.upload(formData);
      
      // 模拟上传完成
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        message.success('文件上传成功！');
        
        // 重置表单
        form.resetFields();
        setUploadFile(null);
        setTags([]);
        setTagInput('');
        setUploading(false);
        setUploadProgress(0);
      }, 2000);

    } catch (error) {
      message.error('文件上传失败');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (file: File) => {
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
        <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: 32 }}>
          文件上传
        </Title>
        
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
            <Form.Item label="选择文件">
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
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(0, 217, 255, 0.1)', borderRadius: 8 }}>
                  <Text strong style={{ color: '#00D9FF' }}>已选择文件：</Text>
                  <Text style={{ color: '#fff', marginLeft: 8 }}>
                    {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
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
              </Form.Item>
            )}

            {/* 文件信息 */}
            <Form.Item
              name="displayName"
              label="文件名称"
              rules={[{ required: true, message: '请输入文件名称' }]}
            >
              <Input placeholder="输入文件显示名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="文件描述"
            >
              <TextArea 
                rows={3} 
                placeholder="简单描述这个文件..." 
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="文件分类"
            >
              <Select placeholder="选择分类">
                <Option value="工作文档">工作文档</Option>
                <Option value="学习资料">学习资料</Option>
                <Option value="图片素材">图片素材</Option>
                <Option value="视频内容">视频内容</Option>
                <Option value="音频文件">音频文件</Option>
                <Option value="软件工具">软件工具</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            {/* 标签输入 */}
            <Form.Item label="文件标签">
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
              <Text type="secondary" style={{ fontSize: '0.85rem', marginTop: 4, display: 'block' }}>
                添加相关标签，便于其他用户搜索和发现
              </Text>
            </Form.Item>

            {/* 访问权限设置 */}
            <Form.Item
              name="isPublic"
              valuePropName="checked"
            >
              <Space>
                <Switch />
                <Text style={{ color: '#fff' }}>公开文件</Text>
                <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                  （关闭后文件将不会在公开列表中显示）
                </Text>
              </Space>
            </Form.Item>

            <Form.Item
              name="accessLevel"
              label="访问权限"
            >
              <Select>
                <Option value="public">所有人可访问</Option>
                <Option value="friends">仅好友可访问</Option>
                <Option value="link">仅通过链接访问</Option>
                <Option value="private">仅自己可访问</Option>
              </Select>
            </Form.Item>

            {/* 提交按钮 */}
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={uploading}
                disabled={!uploadFile}
                block
                style={{ height: 48, fontSize: '1.1rem' }}
              >
                {uploading ? '上传中...' : '开始上传'}
              </Button>
            </Form.Item>
          </Form>
        </StyledCard>
      </motion.div>
    </UploadContainer>
  );
};

export default FileUpload;
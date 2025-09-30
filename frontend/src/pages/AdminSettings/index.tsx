import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Space,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  message,
  Divider,
  Typography,
  Alert,
  Upload,
  Modal
} from 'antd';
import {
  SettingOutlined,
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import adminAPI from '../../utils/api/admin';

const { Option } = Select;

// 样式组件
const AdminContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const SettingCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  
  .ant-card-body {
    padding: 20px;
  }
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin-bottom: 16px;
    
    .ant-card-body {
      padding: 16px 12px;
    }
    
    .ant-card-head-title {
      font-size: 16px;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    
    .ant-card-body {
      padding: 12px 8px;
    }
    
    .ant-card-head-title {
      font-size: 15px;
    }
  }
`;

const ActionButton = styled(Button)`
  margin: 0 4px;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin: 0 2px;
    padding: 0 8px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    margin: 0 1px;
    padding: 0 6px;
    font-size: 11px;
  }
`;

// 移动端表单优化
const MobileForm = styled(Form)`
  @media (max-width: 768px) {
    .ant-form-item {
      margin-bottom: 16px;
    }
    
    .ant-form-item-label {
      padding: 0 0 4px;
    }
    
    .ant-input,
    .ant-select,
    .ant-switch {
      font-size: 14px;
    }
    
    .ant-form-item-explain {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-form-item {
      margin-bottom: 12px;
    }
    
    .ant-input,
    .ant-select,
    .ant-switch {
      font-size: 13px;
    }
    
    .ant-form-item-explain {
      font-size: 11px;
    }
  }
`;

// 移动端提醒优化
const MobileAlert = styled(Alert)`
  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding: 8px 12px;
    
    .ant-alert-message {
      font-size: 14px;
    }
    
    .ant-alert-description {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    padding: 6px 10px;
    
    .ant-alert-message {
      font-size: 13px;
    }
    
    .ant-alert-description {
      font-size: 11px;
    }
  }
`;

// 接口定义
interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    allowRegistration: boolean;
    defaultUserRole: string;
  };
  upload: {
    maxFileSize: string;
    allowedFileTypes: string[];
    uploadPath: string;
  };
  security: {
    jwtExpire: string;
    bcryptRounds: string;
    enableTwoFactor: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromAddress: string;
  };
}

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: '镜瞳OVO',
      siteDescription: '集文件管理与社交互动于一体的现代化平台',
      allowRegistration: true,
      defaultUserRole: 'user'
    },
    upload: {
      maxFileSize: '2147483648',
      allowedFileTypes: ['image/*', 'video/*', 'audio/*', 'application/*'],
      uploadPath: './uploads'
    },
    security: {
      jwtExpire: '24h',
      bcryptRounds: '12',
      enableTwoFactor: false
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromAddress: ''
    }
  });
  const [form] = Form.useForm();
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载系统设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSettings();
      setSettings(response.data.data);
      form.setFieldsValue(response.data.data);
    } catch (error) {
      console.error('加载系统设置失败:', error);
      message.error('加载系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存系统设置
  const handleSaveSettings = async (values: any) => {
    try {
      await adminAPI.updateSettings(values);
      message.success('设置保存成功');
    } catch (error) {
      console.error('保存系统设置失败:', error);
      message.error('保存系统设置失败');
    }
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
  };

  return (
    <AdminContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title 
          level={isMobile ? 4 : 2} 
          style={{ 
            marginBottom: isMobile ? 16 : 24, 
            color: '#1a365d',
            fontSize: isMobile ? '18px' : '30px'
          }}
        >
          <SettingOutlined style={{ marginRight: 8 }} />
          系统设置
        </Typography.Title>

        <MobileForm
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
          initialValues={settings}
        >
          {/* 基本设置 */}
          <SettingCard 
            title={
              <span style={{ 
                fontSize: isMobile ? '16px' : '20px' 
              }}>
                基本设置
              </span>
            }
          >
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'siteName']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      网站名称
                    </span>
                  }
                  rules={[{ required: true, message: '请输入网站名称' }]}
                >
                  <Input 
                    placeholder="请输入网站名称" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'siteDescription']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      网站描述
                    </span>
                  }
                >
                  <Input.TextArea 
                    placeholder="请输入网站描述" 
                    rows={isMobile ? 2 : 3} 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'allowRegistration']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      允许注册
                    </span>
                  }
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="开启" 
                    unCheckedChildren="关闭" 
                    size={isMobile ? "small" : "default"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'defaultUserRole']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      默认用户角色
                    </span>
                  }
                >
                  <Select size={isMobile ? "middle" : "large"}>
                    <Option value="user">普通用户</Option>
                    <Option value="moderator">版主</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </SettingCard>

          {/* 上传设置 */}
          <SettingCard 
            title={
              <span style={{ 
                fontSize: isMobile ? '16px' : '20px' 
              }}>
                上传设置
              </span>
            }
          >
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['upload', 'maxFileSize']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      最大文件大小（字节）
                    </span>
                  }
                >
                  <Input 
                    placeholder="请输入最大文件大小" 
                    type="number" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['upload', 'uploadPath']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      上传路径
                    </span>
                  }
                >
                  <Input 
                    placeholder="请输入上传路径" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24}>
                <Form.Item
                  name={['upload', 'allowedFileTypes']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      允许的文件类型
                    </span>
                  }
                >
                  <Select 
                    mode="tags" 
                    placeholder="请输入允许的文件类型"
                    size={isMobile ? "middle" : "large"}
                  >
                    <Option value="image/*">图片文件</Option>
                    <Option value="video/*">视频文件</Option>
                    <Option value="audio/*">音频文件</Option>
                    <Option value="application/*">应用程序文件</Option>
                    <Option value="text/*">文本文件</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </SettingCard>

          {/* 安全设置 */}
          <SettingCard 
            title={
              <span style={{ 
                fontSize: isMobile ? '16px' : '20px' 
              }}>
                安全设置
              </span>
            }
          >
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['security', 'jwtExpire']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      JWT过期时间
                    </span>
                  }
                >
                  <Input 
                    placeholder="例如: 24h, 7d" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['security', 'bcryptRounds']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      BCrypt加密轮数
                    </span>
                  }
                >
                  <Input 
                    placeholder="例如: 12" 
                    type="number" 
                    min={10} 
                    max={15} 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24}>
                <Form.Item
                  name={['security', 'enableTwoFactor']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      启用双因素认证
                    </span>
                  }
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="开启" 
                    unCheckedChildren="关闭" 
                    size={isMobile ? "small" : "default"}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SettingCard>

          {/* 邮件设置 */}
          <SettingCard 
            title={
              <span style={{ 
                fontSize: isMobile ? '16px' : '20px' 
              }}>
                邮件设置
              </span>
            }
          >
            <MobileAlert
              message="邮件设置"
              description="配置SMTP服务器以启用邮件通知功能"
              type="info"
              showIcon
              style={{ marginBottom: isMobile ? 16 : 24 }}
            />
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpHost']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      SMTP主机
                    </span>
                  }
                >
                  <Input 
                    placeholder="例如: smtp.gmail.com" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpPort']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      SMTP端口
                    </span>
                  }
                >
                  <Input 
                    placeholder="例如: 587" 
                    type="number" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpUser']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      SMTP用户名
                    </span>
                  }
                >
                  <Input 
                    placeholder="请输入SMTP用户名" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpPassword']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      SMTP密码
                    </span>
                  }
                >
                  <Input.Password 
                    placeholder="请输入SMTP密码" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24}>
                <Form.Item
                  name={['email', 'fromAddress']}
                  label={
                    <span style={{ 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      发件人邮箱
                    </span>
                  }
                >
                  <Input 
                    placeholder="例如: noreply@yoursite.com" 
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SettingCard>

          {/* 操作按钮 */}
          <Card>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size={isMobile ? "middle" : "large"}
              >
                保存设置
              </Button>
              <Button
                onClick={handleReset}
                icon={<ReloadOutlined />}
                size={isMobile ? "middle" : "large"}
              >
                重置
              </Button>
            </Space>
          </Card>
        </MobileForm>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminSettings;
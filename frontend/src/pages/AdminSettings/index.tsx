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
`;

const SettingCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  
  .ant-card-body {
    padding: 20px;
  }
`;

const ActionButton = styled(Button)`
  margin: 0 4px;
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
      siteName: '文件社交平台',
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
        <Typography.Title level={2} style={{ marginBottom: 24, color: '#1a365d' }}>
          <SettingOutlined style={{ marginRight: 8 }} />
          系统设置
        </Typography.Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
          initialValues={settings}
        >
          {/* 基本设置 */}
          <SettingCard title="基本设置">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'siteName']}
                  label="网站名称"
                  rules={[{ required: true, message: '请输入网站名称' }]}
                >
                  <Input placeholder="请输入网站名称" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'siteDescription']}
                  label="网站描述"
                >
                  <Input.TextArea placeholder="请输入网站描述" rows={3} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'allowRegistration']}
                  label="允许注册"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['general', 'defaultUserRole']}
                  label="默认用户角色"
                >
                  <Select>
                    <Option value="user">普通用户</Option>
                    <Option value="moderator">版主</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </SettingCard>

          {/* 上传设置 */}
          <SettingCard title="上传设置">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['upload', 'maxFileSize']}
                  label="最大文件大小（字节）"
                >
                  <Input placeholder="请输入最大文件大小" type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['upload', 'uploadPath']}
                  label="上传路径"
                >
                  <Input placeholder="请输入上传路径" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24}>
                <Form.Item
                  name={['upload', 'allowedFileTypes']}
                  label="允许的文件类型"
                >
                  <Select mode="tags" placeholder="请输入允许的文件类型">
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
          <SettingCard title="安全设置">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['security', 'jwtExpire']}
                  label="JWT过期时间"
                >
                  <Input placeholder="例如: 24h, 7d" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['security', 'bcryptRounds']}
                  label="BCrypt加密轮数"
                >
                  <Input placeholder="例如: 12" type="number" min={10} max={15} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24}>
                <Form.Item
                  name={['security', 'enableTwoFactor']}
                  label="启用双因素认证"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              </Col>
            </Row>
          </SettingCard>

          {/* 邮件设置 */}
          <SettingCard title="邮件设置">
            <Alert
              message="邮件设置"
              description="配置SMTP服务器以启用邮件通知功能"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpHost']}
                  label="SMTP主机"
                >
                  <Input placeholder="例如: smtp.gmail.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpPort']}
                  label="SMTP端口"
                >
                  <Input placeholder="例如: 587" type="number" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpUser']}
                  label="SMTP用户名"
                >
                  <Input placeholder="请输入SMTP用户名" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['email', 'smtpPassword']}
                  label="SMTP密码"
                >
                  <Input.Password placeholder="请输入SMTP密码" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24}>
                <Form.Item
                  name={['email', 'fromAddress']}
                  label="发件人邮箱"
                >
                  <Input placeholder="例如: noreply@yoursite.com" />
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
              >
                保存设置
              </Button>
              <Button
                onClick={handleReset}
                icon={<ReloadOutlined />}
              >
                重置
              </Button>
            </Space>
          </Card>
        </Form>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminSettings;
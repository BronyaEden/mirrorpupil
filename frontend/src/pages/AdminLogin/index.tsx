import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Alert,
  Space,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  SafetyOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// 样式组件
const AdminLoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  border: none;
  
  .ant-card-body {
    padding: 40px;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LogoIcon = styled.div`
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
`;

const LoginForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }
  
  .ant-input-affix-wrapper {
    padding: 12px 15px;
    border-radius: 8px;
    border: 2px solid #f0f0f0;
    transition: all 0.3s ease;
    
    &:hover, &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin-top: 8px;
  
  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const SecurityNotice = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

interface AdminLoginForm {
  username: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (values: AdminLoginForm) => {
    setLoading(true);
    setError('');
    
    try {
      // 模拟管理员登录验证
      // TODO: 替换为实际的API调用
      if (values.username === 'admin' && values.password === 'admin123') {
        // 设置管理员会话
        localStorage.setItem('adminToken', 'admin-jwt-token');
        localStorage.setItem('adminUser', JSON.stringify({
          id: 'admin',
          username: 'admin',
          role: 'admin'
        }));
        
        // 跳转到管理后台
        navigate('/admin/dashboard');
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLoginContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <LoginCard>
          <LoginHeader>
            <LogoIcon>
              <SecurityScanOutlined />
            </LogoIcon>
            <Typography.Title level={2} style={{ margin: 0, color: '#1a365d' }}>
              管理员登录
            </Typography.Title>
            <Typography.Text type="secondary">
              镜瞳OVO - 后台管理系统
            </Typography.Text>
          </LoginHeader>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <LoginForm
            form={form}
            onFinish={handleLogin}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入管理员用户名' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="管理员用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="管理员密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <LoginButton
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                登录管理后台
              </LoginButton>
            </Form.Item>
          </LoginForm>

          <Divider />

          <SecurityNotice>
            <Space direction="vertical" size="small">
              <div>
                <SafetyOutlined style={{ color: '#667eea', marginRight: 8 }} />
                <Typography.Text strong style={{ color: '#667eea' }}>安全提醒</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                • 请使用授权的管理员账户登录
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                • 登录活动将被记录和监控
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                • 请在安全的网络环境下使用
              </Typography.Text>
            </Space>
          </SecurityNotice>
        </LoginCard>
      </motion.div>
    </AdminLoginContainer>
  );
};

export default AdminLogin;
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
import adminAPI from '../../utils/api/admin';

// 样式组件
const AdminLoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #ff6b6b 50%, #4ecdc4 75%, #ffe66d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  /* 添加动画效果让渐变更生动 */
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  /* 为登录页面添加自定义鼠标样式 */
  cursor: default;
  
  /* 为可交互元素添加特殊鼠标样式 */
  input, button, .ant-input, .ant-btn {
    cursor: pointer;
  }
  
  .ant-input:hover, .ant-input:focus {
    cursor: text;
  }
`;

// 添加一个简单的鼠标跟踪效果
const MouseTracker: React.FC = () => {
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const tracker = document.querySelector('div[data-mouse-tracker]');
      if (tracker) {
        tracker.setAttribute('style', `
          position: fixed;
          left: ${e.clientX - 5}px;
          top: ${e.clientY - 5}px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.1s ease;
        `);
      }
    };

    // 创建鼠标跟踪器
    const tracker = document.createElement('div');
    tracker.setAttribute('data-mouse-tracker', 'true');
    document.body.appendChild(tracker);

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (tracker.parentNode) {
        tracker.parentNode.removeChild(tracker);
      }
    };
  }, []);

  return null;
};

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  border: none;
  
  /* 为卡片添加渐变边框效果 */
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  
  &:before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #667eea, #764ba2, #ff6b6b, #4ecdc4, #ffe66d);
    border-radius: 18px;
    z-index: -1;
    background-size: 400% 400%;
    animation: gradientShift 8s ease infinite;
  }
  
  .ant-card-body {
    padding: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
  }
  
  /* 确保卡片内的所有元素都有清晰的鼠标反馈 */
  * {
    cursor: inherit;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  /* 为标题区域添加渐变背景 */
  padding: 20px;
  margin: -40px -40px 32px -40px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(90deg, #667eea, #764ba2, #ff6b6b);
`;

const LogoIcon = styled.div`
  font-size: 48px;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  
  /* 为表单元素添加明确的焦点样式 */
  .ant-input, .ant-input-password {
    &:focus {
      border-color: #667eea !important;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
    }
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ff6b6b 100%);
  border: none;
  margin-top: 8px;
  
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 50%, #ff5252 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  /* 确保按钮有明确的悬停和焦点状态 */
  &:focus {
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
  
  /* 添加按钮动画效果 */
  transition: all 0.3s ease;
`;

const SecurityNotice = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(124, 75, 162, 0.1) 100%);
  border-radius: 8px;
  border-left: 4px solid #667eea;
  
  /* 添加微妙的动画效果 */
  background-size: 200% 200%;
  animation: subtlePulse 3s ease-in-out infinite;
  
  @keyframes subtlePulse {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
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
      console.log('AdminLogin - Attempting login with:', values);
      // 调用实际的管理员登录API
      const response = await adminAPI.login({
        username: values.username,
        password: values.password
      });
      
      console.log('AdminLogin - Login response:', response);
      
      if (response.data.success) {
        // 设置管理员会话
        localStorage.setItem('adminToken', response.data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.data.admin));
        
        console.log('AdminLogin - Login successful, redirecting to dashboard');
        // 跳转到管理后台
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || '登录失败');
      }
    } catch (err: any) {
      console.error('AdminLogin - Login error:', err);
      setError(err.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLoginContainer>
      <MouseTracker />
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
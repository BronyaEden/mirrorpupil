import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { loginUser, registerUser } from '../../store/authSlice';
import { AppDispatch } from '../../store';

const { Title, Text } = Typography;

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #0B1426 0%, #1A2332 50%, #2A3441 100%);
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  
  .ant-card-body {
    padding: ${props => props.theme.spacing.xl};
  }
`;

const AuthTitle = styled(Title)`
  &.ant-typography {
    color: ${props => props.theme.colors.text.primary};
    text-align: center;
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

const ModeToggle = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
`;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isLogin) {
        await dispatch(loginUser({
          email: values.email,
          password: values.password,
        })).unwrap();
        message.success('登录成功！');
        navigate('/');
      } else {
        await dispatch(registerUser({
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        })).unwrap();
        message.success('注册成功！');
        navigate('/');
      }
    } catch (error: any) {
      message.error(error || (isLogin ? '登录失败' : '注册失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle level={2}>
          {isLogin ? '欢迎回来' : '加入我们'}
        </AuthTitle>
        
        <Form
          name={isLogin ? 'login' : 'register'}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {!isLogin && (
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 30, message: '用户名不能超过30个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>
          )}
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱地址"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>
          
          {!isLogin && (
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>
          )}
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              {isLogin ? '登录' : '注册'}
            </Button>
          </Form.Item>
        </Form>
        
        {isLogin && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Link to="/forgot-password">
              <Text type="secondary">忘记密码？</Text>
            </Link>
          </div>
        )}
        
        <Divider style={{ borderColor: '#444' }}>
          <Text type="secondary">或</Text>
        </Divider>
        
        <ModeToggle>
          <Text type="secondary">
            {isLogin ? '还没有账号？' : '已有账号？'}
          </Text>
          <Button
            type="link"
            onClick={() => setIsLogin(!isLogin)}
            style={{ padding: 0, marginLeft: 8 }}
          >
            {isLogin ? '立即注册' : '立即登录'}
          </Button>
        </ModeToggle>
        
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/">
            <Text type="secondary">返回首页</Text>
          </Link>
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthPage;
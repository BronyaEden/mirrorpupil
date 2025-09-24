import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { loginUser, registerUser } from '../../store/authSlice';
import { AppDispatch } from '../../store';

// 多彩动态背景容器
const AuthContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  
  /* 多彩渐变背景 */
  background: linear-gradient(45deg, 
    #FF6B6B 0%, 
    #4ECDC4 15%, 
    #45B7D1 30%, 
    #96CEB4 45%, 
    #FFEAA7 60%, 
    #DDA0DD 75%, 
    #98D8C8 90%, 
    #F7DC6F 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  
  /* 背景粒子效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 3px, transparent 3px);
    background-size: 50px 50px, 30px 30px, 80px 80px;
    animation: particleFloat 20s linear infinite;
    z-index: 1;
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes particleFloat {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-100px) rotate(360deg); }
  }
`;

// 玻璃态卡片
const AuthCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 24px !important;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 15px 25px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  position: relative;
  z-index: 10;
  overflow: hidden;
  animation: slideUp 0.8s ease-out;
  
  /* 卡片光晕效果 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: cardGlow 4s ease-in-out infinite;
    z-index: -1;
  }
  
  .ant-card-body {
    padding: 32px !important;
    overflow: visible;
    max-height: calc(90vh - 64px);
    display: flex;
    flex-direction: column;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes cardGlow {
    0%, 100% { opacity: 0.5; transform: rotate(0deg); }
    50% { opacity: 1; transform: rotate(180deg); }
  }
`;

// 炫彩标题
const AuthTitle = styled(Typography.Title)`
  &.ant-typography {
    text-align: center;
    margin-bottom: 24px;
    font-size: 2.2rem !important;
    font-weight: 800 !important;
    background: linear-gradient(45deg, 
      #FF0080 0%, 
      #00FFFF 25%, 
      #FFFF00 50%, 
      #FF4500 75%, 
      #00FF80 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textShimmer 3s ease-in-out infinite;
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
  
  @keyframes textShimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

// 自定义输入框
const StyledInput = styled(Input)`
  &.ant-input-affix-wrapper {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease !important;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:hover, &:focus, &.ant-input-affix-wrapper-focused {
      border-color: rgba(0, 255, 255, 0.8) !important;
      background: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 
        0 0 20px rgba(0, 255, 255, 0.3),
        inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      transform: translateY(-2px);
    }
    
    .ant-input {
      background: transparent !important;
      border: none !important;
      color: #fff !important;
      font-size: 1rem !important;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6) !important;
      }
    }
    
    .ant-input-prefix {
      color: rgba(255, 255, 255, 0.8) !important;
      margin-right: 12px;
    }
  }
`;

// 自定义密码输入框
const StyledPasswordInput = styled(Input.Password)`
  &.ant-input-affix-wrapper {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease !important;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:hover, &:focus, &.ant-input-affix-wrapper-focused {
      border-color: rgba(0, 255, 255, 0.8) !important;
      background: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 
        0 0 20px rgba(0, 255, 255, 0.3),
        inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      transform: translateY(-2px);
    }
    
    .ant-input {
      background: transparent !important;
      border: none !important;
      color: #fff !important;
      font-size: 1rem !important;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6) !important;
      }
    }
    
    .ant-input-prefix, .ant-input-suffix {
      color: rgba(255, 255, 255, 0.8) !important;
    }
  }
`;

// 炫彩按钮
const StyledButton = styled(Button)`
  &.ant-btn-primary {
    width: 100%;
    height: 52px !important;
    background: linear-gradient(135deg, #FF0080 0%, #00FFFF 25%, #FFFF00 50%, #FF4500 75%, #00FF80 100%) !important;
    background-size: 200% 200%;
    border: none !important;
    border-radius: 12px !important;
    color: white !important;
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    transition: all 0.3s ease;
    animation: buttonGradient 3s ease infinite;
    box-shadow: 
      0 8px 25px rgba(255, 0, 128, 0.3),
      0 4px 15px rgba(0, 255, 255, 0.2);
    text-transform: uppercase;
    letter-spacing: 1px;
    
    &:hover, &:focus {
      transform: translateY(-3px) scale(1.02) !important;
      box-shadow: 
        0 12px 35px rgba(255, 0, 128, 0.4),
        0 6px 20px rgba(0, 255, 255, 0.3) !important;
      animation-duration: 1s;
    }
    
    &:active {
      transform: translateY(-1px) scale(0.98) !important;
    }
  }
  
  @keyframes buttonGradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

// 表单标签
const FormLabel = styled.div`
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

// 自定义分割线
const StyledDivider = styled(Divider)`
  &.ant-divider {
    border-color: transparent !important;
    margin: 20px 0 !important;
    
    &::before, &::after {
      border-top: 2px solid transparent !important;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      height: 2px;
      content: '';
    }
    
    .ant-divider-inner-text {
      color: rgba(255, 255, 255, 0.8) !important;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      font-size: 0.9rem;
    }
  }
`;

// 炫彩链接
const StyledLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9) !important;
  text-decoration: none !important;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    color: #00FFFF !important;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
    transform: translateY(-1px);
  }
`;

// 炫彩文本
const StyledText = styled(Typography.Text)`
  &.ant-typography {
    color: rgba(255, 255, 255, 0.8) !important;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

// 模式切换容器
const ModeToggle = styled.div`
  text-align: center;
  margin-top: 16px;
`;

// 模式切换按钮
const ModeToggleButton = styled(Button)`
  &.ant-btn-link {
    color: #00FFFF !important;
    font-weight: 700 !important;
    padding: 0 !important;
    margin-left: 8px;
    text-decoration: underline !important;
    transition: all 0.3s ease;
    
    &:hover, &:focus {
      color: #FFFF00 !important;
      text-shadow: 0 0 10px rgba(255, 255, 0, 0.6);
    }
  }
`;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // 禁用页面滚动
  React.useEffect(() => {
    // 隐藏滚动条并禁用滚动
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // 组件卸载时恢复滚动
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isLogin) {
        console.log('Attempting login with:', values.email);
        const result = await dispatch(loginUser({
          email: values.email,
          password: values.password,
        })).unwrap();
        console.log('Login result:', result);
        message.success('登录成功！');
        // 登录成功后导航到个人中心页面而不是首页
        navigate('/profile');
      } else {
        console.log('Attempting registration with:', values.username, values.email);
        const result = await dispatch(registerUser({
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        })).unwrap();
        console.log('Registration result:', result);
        message.success('注册成功！');
        // 注册成功后也导航到个人中心页面
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Login/Register error:', error);
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
              style={{ marginBottom: 16 }}
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 1, message: '用户名至少1个字符' },
                { max: 30, message: '用户名不能超过30个字符' },
              ]}
            >
              <div>
                <FormLabel>用户名</FormLabel>
                <StyledInput
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              </div>
            </Form.Item>
          )}
          
          <Form.Item
            name="email"
            style={{ marginBottom: 16 }}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <div>
              <FormLabel>邮箱地址</FormLabel>
              <StyledInput
                prefix={<MailOutlined />}
                placeholder="请输入邮箱地址"
              />
            </div>
          </Form.Item>
          
          <Form.Item
            name="password"
            style={{ marginBottom: 16 }}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <div>
              <FormLabel>密码</FormLabel>
              <StyledPasswordInput
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </div>
          </Form.Item>
          
          {!isLogin && (
            <Form.Item
              name="confirmPassword"
              style={{ marginBottom: 16 }}
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
              <div>
                <FormLabel>确认密码</FormLabel>
                <StyledPasswordInput
                  prefix={<LockOutlined />}
                  placeholder="请确认密码"
                />
              </div>
            </Form.Item>
          )}
          
          <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
            <StyledButton
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {isLogin ? '登录' : '注册'}
            </StyledButton>
          </Form.Item>
        </Form>
        
        {isLogin && (
          <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 12 }}>
            <StyledLink to="/forgot-password">
              忘记密码？
            </StyledLink>
          </div>
        )}
        
        <StyledDivider>
          或
        </StyledDivider>
        
        <ModeToggle>
          <StyledText>
            {isLogin ? '还没有账号？' : '已有账号？'}
          </StyledText>
          <ModeToggleButton
            type="link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? '立即注册' : '立即登录'}
          </ModeToggleButton>
        </ModeToggle>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <StyledLink to="/">
            返回首页
          </StyledLink>
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthPage;
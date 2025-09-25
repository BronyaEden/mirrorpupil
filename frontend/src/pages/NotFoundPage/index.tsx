import React from 'react';
import { Result, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Title, Paragraph } = Typography;

const NotFoundContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0B1426 0%, #1A2332 100%);
  padding: 24px;
`;

const NotFoundCard = styled.div`
  background: rgba(31, 41, 55, 0.8);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(75, 85, 99, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <NotFoundContainer>
      <NotFoundCard>
        <Result
          status="404"
          title="404"
          subTitle="抱歉，您访问的页面不存在。"
          extra={[
            <Button type="primary" key="home" onClick={handleGoHome}>
              返回首页
            </Button>,
            <Button key="back" onClick={handleGoBack} style={{ marginLeft: 16 }}>
              返回上一页
            </Button>,
          ]}
        >
          <div>
            <Title level={4}>可能的原因</Title>
            <Paragraph>
              <ul style={{ textAlign: 'left', color: '#d1d5db' }}>
                <li>您输入的网址有误</li>
                <li>该页面已被删除或移动</li>
                <li>您没有访问该页面的权限</li>
              </ul>
            </Paragraph>
          </div>
        </Result>
      </NotFoundCard>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
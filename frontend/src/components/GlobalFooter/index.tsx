import React from 'react';
import { Layout, Space, Typography } from 'antd';
import { GithubOutlined, TwitterOutlined, WechatOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const StyledFooter = styled(AntFooter)`
  background: rgba(31, 41, 55, 0.95);
  border-top: 1px solid rgba(75, 85, 99, 0.5);
  text-align: center;
  padding: 24px;
  color: #9ca3af;
  backdrop-filter: blur(10px);
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SocialLinks = styled(Space)`
  margin-bottom: 16px;
  
  .anticon {
    font-size: 1.2rem;
    color: #9ca3af;
    transition: color 0.2s ease;
    
    &:hover {
      color: #1890ff;
    }
  }
`;

const GlobalFooter: React.FC = () => {
  return (
    <StyledFooter>
      <FooterContent>
        <SocialLinks size="large">
          <Link href="https://github.com" target="_blank">
            <GithubOutlined />
          </Link>
          <Link href="https://twitter.com" target="_blank">
            <TwitterOutlined />
          </Link>
          <Link href="#" target="_blank">
            <WechatOutlined />
          </Link>
        </SocialLinks>
        
        <div>
          <Text type="secondary">
            © 2024 镜瞳OVO. All rights reserved.
          </Text>
        </div>
        
        <div style={{ marginTop: 8 }}>
          <Space split="·">
            <Link href="/privacy" type="secondary">隐私政策</Link>
            <Link href="/terms" type="secondary">服务条款</Link>
            <Link href="/about" type="secondary">关于我们</Link>
            <Link href="/help" type="secondary">帮助中心</Link>
          </Space>
        </div>
      </FooterContent>
    </StyledFooter>
  );
};

export default GlobalFooter;
import React from 'react';
import { Typography, Button, Row, Col, Card, Space } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  CloudUploadOutlined,
  ShareAltOutlined,
  MessageOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex, ResponsiveText } from '../../components/ResponsiveComponents';
import { useViewport } from '../../hooks/useResponsive';
import { mediaQuery } from '../../styles/responsive';
import { AnimatedCard } from '../../components/PageTransition';
import { theme } from '../../styles/theme';

const { Title, Paragraph } = Typography;

const HeroSection = styled.div`
  text-align: center;
  padding: 80px 40px;
  background: ${theme.gradients.cosmic};
  border-radius: 24px;
  margin-bottom: 64px;
  position: relative;
  overflow: hidden;
  box-shadow: ${theme.shadows.dramatic};
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 215, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 215, 0, 0.05) 75%), 
                linear-gradient(45deg, rgba(255, 215, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 215, 0, 0.05) 75%);
    background-size: 40px 40px;
    background-position: 0 0, 20px 20px;
    opacity: 0.3;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  ${mediaQuery.mobile(`
    padding: 48px 24px;
    margin-bottom: 40px;
    border-radius: 16px;
  `)}
`;

const HeroTitle = styled(Title)`
  &.ant-typography {
    color: #fff;
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 24px;
    text-shadow: 0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(0, 217, 255, 0.3);
    background: ${theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    z-index: 1;
    
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      color: rgba(255, 255, 255, 0.1);
      text-shadow: none;
      -webkit-text-fill-color: rgba(255, 255, 255, 0.1);
    }
    
    ${mediaQuery.mobile(`
      font-size: 2.5rem;
    `)}
    
    ${mediaQuery.xs(`
      font-size: 2rem;
    `)}
  }
`;

const HeroSubtitle = styled(Paragraph)`
  &.ant-typography {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.3rem;
    font-weight: 400;
    max-width: 700px;
    margin: 0 auto 40px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    line-height: 1.8;
    position: relative;
    z-index: 1;
    
    ${mediaQuery.mobile(`
      font-size: 1.1rem;
      margin-bottom: 32px;
      line-height: 1.6;
    `)}
  }
`;

const FeatureCard = styled(Card)`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  box-shadow: ${theme.shadows.floating};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: ${theme.shadows.neon};
    border-color: rgba(0, 217, 255, 0.6);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
    
    &::before {
      left: 100%;
    }
  }
  
  .ant-card-meta-title {
    color: #fff;
    font-weight: 700;
    font-size: 1.2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .ant-card-meta-description {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    line-height: 1.6;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3.5rem;
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  text-align: center;
  filter: drop-shadow(0 4px 8px rgba(0, 217, 255, 0.3));
  transition: all 0.3s ease;
  
  .ant-card:hover & {
    transform: scale(1.1) rotate(5deg);
    filter: drop-shadow(0 6px 12px rgba(0, 217, 255, 0.5));
  }
  
  ${mediaQuery.mobile(`
    font-size: 3rem;
  `)}
`;

const ActionButtons = styled(Space)`
  .ant-btn {
    height: 52px;
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0 40px;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &.ant-btn-primary {
      background: ${theme.gradients.primary};
      border: none;
      box-shadow: ${theme.shadows.colorful};
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.neon};
        
        &::before {
          left: 100%;
        }
      }
    }
    
    &:not(.ant-btn-primary) {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(0, 217, 255, 0.6);
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.floating};
      }
    }
    
    ${mediaQuery.mobile(`
      height: 48px;
      font-size: 1rem;
      padding: 0 32px;
    `)}
  }
`;

const CTASection = styled.div`
  text-align: center;
  margin-top: 80px;
  padding: 60px 40px;
  background: ${theme.gradients.sunset};
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: ${theme.shadows.lifted};
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${theme.gradients.rainbow};
    border-radius: 26px;
    z-index: -1;
    animation: borderGlow 3s ease-in-out infinite alternate;
  }
  
  @keyframes borderGlow {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  ${mediaQuery.mobile(`
    margin-top: 48px;
    padding: 40px 24px;
    border-radius: 16px;
  `)}
`;

const HomePage: React.FC = () => {
  const { isMobile } = useViewport();
  
  const features = [
    {
      icon: <CloudUploadOutlined />,
      title: '便捷文件管理',
      description: '支持多种格式文件上传，智能分类管理，快速搜索定位',
    },
    {
      icon: <ShareAltOutlined />,
      title: '安全文件分享',
      description: '灵活的权限控制，安全的分享链接，保护您的文件隐私',
    },
    {
      icon: <MessageOutlined />,
      title: '实时社交互动',
      description: '即时聊天功能，关注好友动态，建立你的社交圈子',
    },
    {
      icon: <SafetyOutlined />,
      title: '企业级安全',
      description: '数据加密传输，多重安全验证，确保文件安全可靠',
    },
  ];

  return (
    <ResponsiveContainer>
      <HeroSection>
        <HeroTitle level={1}>
          文件管理 · 社交互动
        </HeroTitle>
        <HeroSubtitle>
          集文件管理与社交互动于一体的现代化平台，为您提供安全便捷的文件存储分享服务和实时社交体验
        </HeroSubtitle>
        <ResponsiveFlex
          direction={{ xs: 'column', sm: 'row' }}
          justify="center"
          gap="20px"
        >
          <ActionButtons>
            <Button type="primary" size="large">
              <Link to="/files">开始浏览</Link>
            </Button>
            <Button size="large">
              <Link to="/auth">立即注册</Link>
            </Button>
          </ActionButtons>
        </ResponsiveFlex>
      </HeroSection>

      <div>
        <ResponsiveText
          as="h2"
          size={{
            xs: '24px',
            sm: '28px',
            md: '32px'
          }}
          align={{ xs: 'center' }}
          color="#fff"
          style={{ marginBottom: '48px', fontWeight: 600 }}
        >
          平台特色功能
        </ResponsiveText>
        
        <ResponsiveGrid
          columns={{
            xs: 1,
            sm: 2,
            lg: 4
          }}
          gap={{
            xs: '16px',
            sm: '24px',
            md: '24px'
          }}
        >
          {features.map((feature, index) => (
            <AnimatedCard key={index} delay={index * 0.1}>
              <FeatureCard>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Card.Meta
                  title={feature.title}
                  description={feature.description}
                />
              </FeatureCard>
            </AnimatedCard>
          ))}
        </ResponsiveGrid>
      </div>

      <CTASection>
        <ResponsiveText
          as="h3"
          size={{
            xs: '24px',
            sm: '28px',
            md: '32px'
          }}
          color="#fff"
          style={{ marginBottom: '20px', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          准备好开始您的文件社交之旅了吗？
        </ResponsiveText>
        <ResponsiveText
          size={{
            xs: '16px',
            sm: '18px'
          }}
          color="rgba(255,255,255,0.9)"
          style={{ marginBottom: '40px', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
        >
          加入我们的平台，体验全新的文件管理和社交互动方式
        </ResponsiveText>
        <ActionButtons>
          <Button type="primary" size="large">
            <Link to="/auth">免费注册</Link>
          </Button>
        </ActionButtons>
      </CTASection>
    </ResponsiveContainer>
  );
};

export default HomePage;
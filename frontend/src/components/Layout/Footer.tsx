import React from 'react';
import { Layout, Row, Col, Space, Divider } from 'antd';
import { 
  GithubOutlined, 
  TwitterOutlined, 
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useViewport } from '../../hooks/useResponsive';
import { mediaQuery } from '../../styles/responsive';
import { ResponsiveContainer, ResponsiveFlex, ResponsiveText } from '../ResponsiveComponents';

const { Footer: AntFooter } = Layout;

const StyledFooter = styled(AntFooter)`
  background: #001529;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 48px;
  
  ${mediaQuery.mobile(`
    margin-top: 32px;
  `)}
`;

const FooterContent = styled.div`
  padding: 48px 0 24px;
  
  ${mediaQuery.mobile(`
    padding: 32px 0 16px;
  `)}
`;

const FooterSection = styled.div`
  margin-bottom: 24px;
  
  ${mediaQuery.mobile(`
    margin-bottom: 16px;
    text-align: center;
  `)}
`;

const FooterTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  
  ${mediaQuery.mobile(`
    font-size: 14px;
    margin-bottom: 12px;
  `)}
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  transition: color 0.2s;
  
  &:hover {
    color: #1890ff;
  }
  
  ${mediaQuery.mobile(`
    display: inline-block;
    margin: 0 8px 8px 0;
  `)}
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  
  ${mediaQuery.mobile(`
    justify-content: center;
    gap: 24px;
  `)}
`;

const SocialLink = styled.a`
  color: rgba(255, 255, 255, 0.65);
  font-size: 20px;
  transition: color 0.2s;
  
  &:hover {
    color: #1890ff;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
  
  ${mediaQuery.mobile(`
    padding-top: 16px;
    font-size: 12px;
  `)}
`;

const ContactInfo = styled.div`
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
  
  ${mediaQuery.mobile(`
    text-align: center;
  `)}
`;

const Footer: React.FC = () => {
  const { isMobile } = useViewport();

  const quickLinks = [
    { title: '首页', href: '/' },
    { title: '文件管理', href: '/files' },
    { title: '上传文件', href: '/upload' },
    { title: '用户中心', href: '/profile' },
    { title: '聊天', href: '/chat' },
  ];

  const helpLinks = [
    { title: '使用帮助', href: '/help' },
    { title: '常见问题', href: '/faq' },
    { title: '用户协议', href: '/terms' },
    { title: '隐私政策', href: '/privacy' },
    { title: '联系我们', href: '/contact' },
  ];

  const aboutLinks = [
    { title: '关于我们', href: '/about' },
    { title: '团队介绍', href: '/team' },
    { title: '发展历程', href: '/history' },
    { title: '招聘信息', href: '/careers' },
    { title: '媒体报道', href: '/news' },
  ];

  return (
    <StyledFooter>
      <ResponsiveContainer>
        <FooterContent>
          <Row gutter={[32, 24]}>
            {/* 快速链接 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                <FooterTitle>快速链接</FooterTitle>
                {quickLinks.map(link => (
                  <FooterLink key={link.title} href={link.href}>
                    {link.title}
                  </FooterLink>
                ))}
              </FooterSection>
            </Col>

            {/* 帮助中心 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                <FooterTitle>帮助中心</FooterTitle>
                {helpLinks.map(link => (
                  <FooterLink key={link.title} href={link.href}>
                    {link.title}
                  </FooterLink>
                ))}
              </FooterSection>
            </Col>

            {/* 关于我们 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                <FooterTitle>关于我们</FooterTitle>
                {aboutLinks.map(link => (
                  <FooterLink key={link.title} href={link.href}>
                    {link.title}
                  </FooterLink>
                ))}
              </FooterSection>
            </Col>

            {/* 联系信息 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                <FooterTitle>联系我们</FooterTitle>
                
                <ContactInfo>
                  <Space>
                    <EnvironmentOutlined />
                    北京市朝阳区某某街道123号
                  </Space>
                </ContactInfo>
                
                <ContactInfo>
                  <Space>
                    <PhoneOutlined />
                    400-123-4567
                  </Space>
                </ContactInfo>
                
                <ContactInfo>
                  <Space>
                    <MailOutlined />
                    contact@filesocial.com
                  </Space>
                </ContactInfo>

                <div style={{ marginTop: '16px' }}>
                  <FooterTitle style={{ marginBottom: '12px' }}>
                    关注我们
                  </FooterTitle>
                  <SocialLinks>
                    <SocialLink href="https://github.com" target="_blank">
                      <GithubOutlined />
                    </SocialLink>
                    <SocialLink href="https://twitter.com" target="_blank">
                      <TwitterOutlined />
                    </SocialLink>
                    <SocialLink href="mailto:contact@filesocial.com">
                      <MailOutlined />
                    </SocialLink>
                  </SocialLinks>
                </div>
              </FooterSection>
            </Col>
          </Row>
        </FooterContent>

        <Copyright>
          <ResponsiveFlex 
            direction={{ xs: 'column', md: 'row' }}
            justify={isMobile ? 'center' : 'space-between'}
            align="center"
            gap="16px"
          >
            <div>
              © 2024 文件社交平台. 保留所有权利.
            </div>
            {!isMobile && (
              <Space split={<Divider type="vertical" style={{ background: 'rgba(255,255,255,0.3)' }} />}>
                <FooterLink href="/terms" style={{ display: 'inline', margin: 0 }}>
                  用户协议
                </FooterLink>
                <FooterLink href="/privacy" style={{ display: 'inline', margin: 0 }}>
                  隐私政策
                </FooterLink>
                <FooterLink href="/sitemap" style={{ display: 'inline', margin: 0 }}>
                  网站地图
                </FooterLink>
              </Space>
            )}
          </ResponsiveFlex>
        </Copyright>
      </ResponsiveContainer>
    </StyledFooter>
  );
};

export default Footer;
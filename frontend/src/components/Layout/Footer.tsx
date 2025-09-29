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
    padding: 0 8px; /* 减少移动端padding */
  `)}
`;

const FooterContent = styled.div`
  padding: 48px 0 24px;
  
  ${mediaQuery.mobile(`
    padding: 24px 0 16px; /* 减少移动端padding */
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
    margin-bottom: 8px; /* 减少移动端间距 */
  `)}
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  transition: color 0.2s;
  font-size: 14px; /* 统一字体大小 */
  
  &:hover {
    color: #1890ff;
  }
  
  ${mediaQuery.mobile(`
    display: inline-block;
    margin: 0 4px 4px 0; /* 减少移动端间距 */
    font-size: 12px; /* 移动端更小字体 */
  `)}
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  
  ${mediaQuery.mobile(`
    justify-content: center;
    gap: 16px; /* 减少移动端间距 */
  `)}
`;

const SocialLink = styled.a`
  color: rgba(255, 255, 255, 0.65);
  font-size: 20px;
  transition: color 0.2s;
  
  &:hover {
    color: #1890ff;
  }
  
  ${mediaQuery.mobile(`
    font-size: 18px; /* 移动端稍小图标 */
  `)}
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
  font-size: 14px;
  
  ${mediaQuery.mobile(`
    text-align: center;
    font-size: 12px; /* 移动端更小字体 */
    margin-bottom: 4px; /* 减少移动端间距 */
  `)}
`;

// 移动端紧凑版Footer链接容器
const MobileLinksContainer = styled.div`
  ${mediaQuery.mobile(`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 4px; /* 控制链接间的间距 */
  `)}
`;

// 移动端紧凑版标题
const MobileFooterTitle = styled(FooterTitle)`
  ${mediaQuery.mobile(`
    font-size: 13px;
    margin-bottom: 6px;
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
          <Row gutter={[16, 16]}> {/* 减少移动端gutter间距 */}
            {/* 快速链接 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                {isMobile ? (
                  <MobileFooterTitle>快速链接</MobileFooterTitle>
                ) : (
                  <FooterTitle>快速链接</FooterTitle>
                )}
                {isMobile ? (
                  <MobileLinksContainer>
                    {quickLinks.map(link => (
                      <FooterLink key={link.title} href={link.href}>
                        {link.title}
                      </FooterLink>
                    ))}
                  </MobileLinksContainer>
                ) : (
                  <>
                    {quickLinks.map(link => (
                      <FooterLink key={link.title} href={link.href}>
                        {link.title}
                      </FooterLink>
                    ))}
                  </>
                )}
              </FooterSection>
            </Col>

            {/* 帮助中心 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                {isMobile ? (
                  <MobileFooterTitle>帮助中心</MobileFooterTitle>
                ) : (
                  <FooterTitle>帮助中心</FooterTitle>
                )}
                {isMobile ? (
                  <MobileLinksContainer>
                    {helpLinks.map(link => (
                      <FooterLink key={link.title} href={link.href}>
                        {link.title}
                      </FooterLink>
                    ))}
                  </MobileLinksContainer>
                ) : (
                  <>
                    {helpLinks.map(link => (
                      <FooterLink key={link.title} href={link.href}>
                        {link.title}
                      </FooterLink>
                    ))}
                  </>
                )}
              </FooterSection>
            </Col>

            {/* 关于我们 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                {isMobile ? (
                  <MobileFooterTitle>关于我们</MobileFooterTitle>
                ) : (
                  <FooterTitle>关于我们</FooterTitle>
                )}
                {isMobile ? (
                  <MobileLinksContainer>
                    {aboutLinks.map(link => (
                      <FooterLink key={link.title} href={link.href}>
                        {link.title}
                      </FooterLink>
                    ))}
                  </MobileLinksContainer>
                ) : (
                  <>
                    {aboutLinks.map(link => (
                      <FooterLink key={link.title} href={link.href}>
                        {link.title}
                      </FooterLink>
                    ))}
                  </>
                )}
              </FooterSection>
            </Col>

            {/* 联系信息 */}
            <Col xs={24} sm={12} md={6}>
              <FooterSection>
                {isMobile ? (
                  <MobileFooterTitle>联系我们</MobileFooterTitle>
                ) : (
                  <FooterTitle>联系我们</FooterTitle>
                )}
                
                <ContactInfo>
                  <Space size={4}> {/* 减少移动端间距 */}
                    <EnvironmentOutlined />
                    空中花园首席指挥官办公室
                  </Space>
                </ContactInfo>
                
                <ContactInfo>
                  <Space size={4}>
                    <PhoneOutlined />
                    4132132-1433223
                  </Space>
                </ContactInfo>
                
                <ContactInfo>
                  <Space size={4}>
                    <MailOutlined />
                    3383178953@qq.com
                  </Space>
                </ContactInfo>

                <div style={{ marginTop: '12px' }}>
                  {isMobile ? (
                    <MobileFooterTitle style={{ marginBottom: '6px' }}>
                      关注我们
                    </MobileFooterTitle>
                  ) : (
                    <FooterTitle style={{ marginBottom: '12px' }}>
                      关注我们
                    </FooterTitle>
                  )}
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
            gap="12px" /* 减少移动端间距 */
          >
            <div>
              © 2024 镜瞳OVO. 保留所有权利.
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
import React, { useRef, useEffect } from 'react';
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

// 页面容器 - 添加星空和粒子背景
const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  cursor: none;
  
  /* 星空背景 */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -3;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 104px 20px 40px 20px; /* 增加顶部padding为header高度 + 40px */
  
  ${mediaQuery.mobile(`
    padding: 76px 15px 20px 15px; /* 移动端header高度 + 20px */
  `)}
`;

// 星星样式
const Star = styled.div`
  position: fixed;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  z-index: -3;
  pointer-events: none;
  animation: twinkle 3s ease-in-out infinite;
  
  &.medium {
    width: 3px;
    height: 3px;
  }
  
  &.large {
    width: 4px;
    height: 4px;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }
  
  @keyframes twinkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

// 粒子样式
const Particle = styled.div`
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: -2;
  animation: float 6s ease-in-out infinite;
  
  &:nth-child(odd) {
    animation-direction: reverse;
  }
  
  &.cyan {
    background: radial-gradient(circle, rgba(0, 255, 255, 0.6) 0%, transparent 70%);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
  
  &.magenta {
    background: radial-gradient(circle, rgba(255, 0, 255, 0.6) 0%, transparent 70%);
    box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
  }
  
  &.yellow {
    background: radial-gradient(circle, rgba(255, 255, 0, 0.6) 0%, transparent 70%);
    box-shadow: 0 0 20px rgba(255, 255, 0, 0.3);
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
      opacity: 0.7;
    }
    33% {
      transform: translateY(-30px) translateX(20px);
      opacity: 1;
    }
    66% {
      transform: translateY(10px) translateX(-15px);
      opacity: 0.8;
    }
  }
`;

// 自定义鼠标指针 - 已移至GlobalMouseEffects组件
// const CustomCursor = styled.div`...`;

const CursorTrail = styled.div`
  position: fixed;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #667db6 0%, #0082c8 25%, #0082c8 50%, #667db6 75%, #0082c8 100%);
  border-radius: 24px;
  margin-bottom: 64px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 12px 20px rgba(0, 0, 0, 0.3);
  
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

// Hero按钮容器
const HeroButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  
  ${mediaQuery.mobile(`
    flex-direction: column;
    align-items: center;
  `)}
`;

const HeroTitle = styled(Title)`
  &.ant-typography {
    color: #fff;
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 24px;
    text-shadow: 
      0 0 20px rgba(255, 255, 255, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6),
      0 0 60px rgba(255, 100, 255, 0.4),
      0 0 80px rgba(255, 255, 0, 0.3);
    background: linear-gradient(45deg, 
      #FF0080 0%, 
      #00FFFF 20%, 
      #FFFF00 40%, 
      #FF4500 60%, 
      #00FF80 80%, 
      #FF0080 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    z-index: 1;
    animation: rainbow-flow 3s ease-in-out infinite;
    
    @keyframes rainbow-flow {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
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

// 特色功能区域
const FeaturesSection = styled.section`
  margin: 64px 0;
`;

const FeaturesTitle = styled.h2`
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 48px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  
  ${mediaQuery.mobile(`
    grid-template-columns: 1fr;
  `)}
`;
  const FeatureCard = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 32px 24px;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 217, 255, 0.15), 0 5px 15px rgba(255, 215, 0, 0.1);
  
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
    box-shadow: 0 0 10px rgba(0, 217, 255, 0.5), 0 0 20px rgba(0, 217, 255, 0.3), 0 0 40px rgba(0, 217, 255, 0.1);
    border-color: rgba(0, 217, 255, 0.6);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
    
    &::before {
      left: 100%;
    }
  }
`;

const FeatureTitle = styled.h3`
  color: #fff;
  font-weight: 700;
  font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 12px;
  text-align: center;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  text-align: center;
  margin: 0;
`;

const FeatureIcon = styled.div`
  font-size: 3.5rem;
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
  margin-bottom: 20px;
  text-align: center;
  filter: drop-shadow(0 4px 8px rgba(255, 0, 128, 0.4));
  transition: all 0.3s ease;
  animation: icon-glow 4s ease-in-out infinite;
  
  @keyframes icon-glow {
    0%, 100% {
      background-position: 0% 50%;
      filter: drop-shadow(0 4px 8px rgba(255, 0, 128, 0.4));
    }
    50% {
      background-position: 100% 50%;
      filter: drop-shadow(0 6px 12px rgba(0, 255, 255, 0.6));
    }
  }
  
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
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    min-width: 140px;
    
    &.ant-btn-primary {
      background: linear-gradient(135deg, #FF0080 0%, #00FFFF 25%, #FFFF00 50%, #FF4500 75%, #00FF80 100%);
      background-size: 200% 200%;
      color: white;
      box-shadow: 
        0 8px 32px rgba(255, 0, 128, 0.3), 
        0 4px 16px rgba(0, 255, 255, 0.2),
        0 0 20px rgba(255, 255, 0, 0.1);
      animation: gradient-shift 3s ease-in-out infinite;
      
      @keyframes gradient-shift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
      
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
        transform: translateY(-3px) scale(1.05);
        box-shadow: 
          0 0 30px rgba(255, 0, 128, 0.6), 
          0 0 60px rgba(0, 255, 255, 0.4), 
          0 0 90px rgba(255, 255, 0, 0.2);
        animation-duration: 1s;
        
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
        box-shadow: 0 10px 30px rgba(0, 217, 255, 0.15), 0 5px 15px rgba(255, 215, 0, 0.1);
      }
    }
    
    ${mediaQuery.mobile(`
      height: 48px;
      font-size: 1rem;
      padding: 0 32px;
      width: 80%;
      max-width: 300px;
    `)}
  }
`;

// 动画样式
const FadeInSection = styled.div`
  animation: fadeIn 0.8s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FeatureCardWithAnimation = styled(FeatureCard)`
  animation: fadeIn 0.8s ease-out;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
`;

const CTASection = styled.div`
  text-align: center;
  margin-top: 80px;
  padding: 60px 40px;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 15px 15px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%);
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
  const particlesRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  // cursorRef已移除，鼠标特效由GlobalMouseEffects管理
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const particlesArray = useRef<any[]>([]);
  
  // 初始化动态效果
  useEffect(() => {
    // 星空系统
    class StarField {
      starCount: number;
      container: HTMLDivElement | null;
      
      constructor() {
        this.starCount = 200;
        this.container = starsRef.current;
        this.init();
      }
      
      init() {
        if (!this.container) return;
        for (let i = 0; i < this.starCount; i++) {
          this.createStar();
        }
      }
      
      createStar() {
        if (!this.container) return;
        const star = document.createElement('div');
        star.className = 'star';
        
        // 随机大小类型
        const size = Math.random();
        if (size > 0.8) {
          star.classList.add('large');
        } else if (size > 0.6) {
          star.classList.add('medium');
        }
        
        // 随机位置
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // 随机动画延迟
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        // 添加星星样式
        star.style.position = 'fixed';
        star.style.width = '2px';
        star.style.height = '2px';
        star.style.background = 'white';
        star.style.borderRadius = '50%';
        star.style.zIndex = '-3';
        star.style.pointerEvents = 'none';
        
        if (size > 0.8) {
          star.style.width = '4px';
          star.style.height = '4px';
          star.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
        } else if (size > 0.6) {
          star.style.width = '3px';
          star.style.height = '3px';
        }
        
        this.container.appendChild(star);
      }
    }
    
    // 粒子系统
    class ParticleSystem {
      particles: any[];
      particleCount: number;
      container: HTMLDivElement | null;
      
      constructor() {
        this.particles = [];
        this.particleCount = 50;
        this.container = particlesRef.current;
        this.init();
      }
      
      init() {
        if (!this.container) return;
        for (let i = 0; i < this.particleCount; i++) {
          this.createParticle();
        }
        this.animate();
      }
      
      createParticle() {
        if (!this.container) return;
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机颜色类型
        const colors = ['cyan', 'magenta', 'yellow', ''];
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        if (colorClass) particle.classList.add(colorClass);
        
        // 随机大小
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 随机位置
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // 随机动画延迟
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        // 添加粒子样式
        particle.style.position = 'fixed';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '-2';
        
        // 设置默认样式或颜色样式
        if (colorClass === 'cyan') {
          particle.style.background = 'radial-gradient(circle, rgba(0, 255, 255, 0.6) 0%, transparent 70%)';
          particle.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
        } else if (colorClass === 'magenta') {
          particle.style.background = 'radial-gradient(circle, rgba(255, 0, 255, 0.6) 0%, transparent 70%)';
          particle.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.3)';
        } else if (colorClass === 'yellow') {
          particle.style.background = 'radial-gradient(circle, rgba(255, 255, 0, 0.6) 0%, transparent 70%)';
          particle.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.3)';
        } else {
          particle.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)';
        }
        
        this.container.appendChild(particle);
        this.particles.push({
          element: particle,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
      
      animate() {
        this.particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // 边界反弹
          if (particle.x <= 0 || particle.x >= window.innerWidth) {
            particle.vx *= -1;
          }
          if (particle.y <= 0 || particle.y >= window.innerHeight) {
            particle.vy *= -1;
          }
          
          // 保持在视窗内
          particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
          particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
          
          particle.element.style.left = particle.x + 'px';
          particle.element.style.top = particle.y + 'px';
        });
        
        requestAnimationFrame(() => this.animate());
      }
    }
    
    
    // 初始化视觉效果（不包括鼠标特效，已移至GlobalMouseEffects）
    new StarField();
    const particleSystem = new ParticleSystem();
    
    // 保存到ref以便清理
    particlesArray.current = [particleSystem];
    
    // 清理函数
    return () => {
      // 清理星星
      if (starsRef.current) {
        starsRef.current.innerHTML = '';
      }
      
      // 清理粒子
      if (particlesRef.current) {
        particlesRef.current.innerHTML = '';
      }
    };
  }, [isMobile]);
  
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
  
  // 按钮点击事件
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    
    // 添加点击特效
    target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      target.style.transform = '';
    }, 150);
  };

  return (
    <PageContainer>
      {/* 星空背景 */}
      <div ref={starsRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -3, pointerEvents: 'none' }} />
      
      {/* 粒子背景 */}
      <div ref={particlesRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2, pointerEvents: 'none' }} />
      
      {/* 鼠标特效已移至GlobalMouseEffects组件 */}
      
      {/* 主要内容 */}
      <Container>
        {/* Hero Section */}
        <FadeInSection>
          <HeroSection>
            <HeroTitle level={1}>
              文件管理 · 社交互动
            </HeroTitle>
            <HeroSubtitle>
              集文件管理与社交互动于一体的现代化平台，为您提供安全便捷的文件存储分享服务和实时社交体验
            </HeroSubtitle>
            <HeroButtons>
              <ActionButtons>
                <Button type="primary" size="large" onClick={handleButtonClick}>
                  <Link to="/files">开始浏览</Link>
                </Button>
                <Button size="large" onClick={handleButtonClick}>
                  <Link to="/auth">立即注册</Link>
                </Button>
              </ActionButtons>
            </HeroButtons>
          </HeroSection>
        </FadeInSection>

        {/* Features Section */}
        <FeaturesSection>
          <FeaturesTitle>
            平台特色功能
          </FeaturesTitle>
          
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCardWithAnimation key={index}>
                <FeatureCard>
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureCard>
              </FeatureCardWithAnimation>
            ))}
          </FeaturesGrid>
        </FeaturesSection>

        {/* CTA Section */}
        <FadeInSection>
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
              <Button type="primary" size="large" onClick={handleButtonClick}>
                <Link to="/auth">免费注册</Link>
              </Button>
            </ActionButtons>
          </CTASection>
        </FadeInSection>
      </Container>
    </PageContainer>
  );
};

export default HomePage;
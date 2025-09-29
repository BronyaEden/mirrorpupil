import React, { useRef, useEffect } from 'react';
import { Typography, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
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
import { RootState } from '../../store';

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
  padding: 104px clamp(6px, 1vw, 10px) 40px clamp(6px, 1vw, 10px); /* 增加顶部padding为header高度 + 40px */
  
  ${mediaQuery.mobile(`
    padding: 56px clamp(2.5px, 1.25vw, 7.5px) 20px clamp(2.5px, 1.25vw, 7.5px); /* 移动端顶部导航栏高度 + 20px */
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
  
  ${mediaQuery.mobile(`
    margin: 32px 0;
  `)}
`;

const FeaturesTitle = styled.h2`
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 48px;
  
  ${mediaQuery.mobile(`
    font-size: 20px;
    margin-bottom: 24px;
  `)}
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  
  ${mediaQuery.mobile(`
    grid-template-columns: 1fr;
    gap: 12px;
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
  
  ${mediaQuery.mobile(`
    border-radius: 12px;
    padding: 16px 12px;
  `)}
`;

const FeatureTitle = styled.h3`
  color: #fff;
  font-weight: 700;
  font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 12px;
  text-align: center;
  
  ${mediaQuery.mobile(`
    font-size: 0.9rem;
    margin-bottom: 6px;
  `)}
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  text-align: center;
  margin: 0;
  
  ${mediaQuery.mobile(`
    font-size: 0.75rem;
    line-height: 1.4;
  `)}
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
  animation: icon-glow 4s ease-in-out
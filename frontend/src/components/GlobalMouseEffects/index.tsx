import React, { useEffect } from 'react';
import { useViewport } from '../../hooks/useResponsive';

interface GlobalMouseEffectsProps {
  disabled?: boolean;
}

const GlobalMouseEffects: React.FC<GlobalMouseEffectsProps> = ({ disabled = false }) => {
  const { isMobile } = useViewport();

  useEffect(() => {
    if (disabled || isMobile) {
      console.log('🚫 鼠标特效已禁用或在移动设备上');
      return;
    }

    console.log('🌟 初始化全局鼠标特效系统');

    // 清理现有的鼠标特效元素
    const cleanupExisting = () => {
      document.querySelectorAll('[data-global-mouse-effect]').forEach(el => {
        el.remove();
      });
    };

    cleanupExisting();

    // 创建鼠标光球
    const createCursor = () => {
      const cursor = document.createElement('div');
      cursor.setAttribute('data-global-mouse-effect', 'cursor');
      cursor.style.cssText = `
        position: fixed !important;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(0, 255, 255, 0.5) 50%, transparent 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.6);
        transform: translate(-50%, -50%) translateZ(0);
        opacity: 0;
        transition: opacity 0.2s ease;
        will-change: transform, opacity;
      `;
      document.body.appendChild(cursor);
      return cursor;
    };

    // 创建轨迹球
    const createTrails = (count: number) => {
      const trails: HTMLElement[] = [];
      for (let i = 0; i < count; i++) {
        const trail = document.createElement('div');
        trail.setAttribute('data-global-mouse-effect', 'trail');
        trail.style.cssText = `
          position: fixed !important;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, ${0.8 - i * 0.1});
          border-radius: 50%;
          pointer-events: none;
          z-index: 999998;
          transform: translate(-50%, -50%) translateZ(0);
          opacity: 0;
          will-change: transform, opacity;
        `;
        document.body.appendChild(trail);
        trails.push(trail);
      }
      return trails;
    };

    const cursor = createCursor();
    const trails = createTrails(8);
    const trailPositions: Array<{x: number, y: number}> = new Array(8).fill(null).map(() => ({x: 0, y: 0}));
    
    let animationId: number;
    let currentX = 0;
    let currentY = 0;
    let isMouseInWindow = false;

    // 鼠标移动事件处理
    const handleMouseMove = (e: MouseEvent) => {
      // 关键：使用clientX和clientY，这些是相对于视窗的坐标，不受页面滚动影响
      currentX = e.clientX;
      currentY = e.clientY;
      isMouseInWindow = true;
      
      // 直接更新主光球位置
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      cursor.style.opacity = '1';
      
      // 更新轨迹位置数组
      for (let i = trailPositions.length - 1; i > 0; i--) {
        trailPositions[i].x = trailPositions[i - 1].x;
        trailPositions[i].y = trailPositions[i - 1].y;
      }
      trailPositions[0].x = currentX;
      trailPositions[0].y = currentY;
      
      console.log(`🎯 鼠标位置更新: (${currentX}, ${currentY}) - 滚动位置: ${window.scrollY}`);
    };

    // 鼠标离开窗口
    const handleMouseLeave = () => {
      isMouseInWindow = false;
      cursor.style.opacity = '0';
      trails.forEach(trail => {
        trail.style.opacity = '0';
      });
      console.log('🚪 鼠标离开窗口');
    };

    // 鼠标进入窗口
    const handleMouseEnter = () => {
      isMouseInWindow = true;
      cursor.style.opacity = '1';
      console.log('👋 鼠标进入窗口');
    };

    // 点击效果
    const handleClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      const ripple = document.createElement('div');
      ripple.setAttribute('data-global-mouse-effect', 'ripple');
      ripple.style.cssText = `
        position: fixed !important;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        animation: mouseRipple 0.6s ease-out forwards;
      `;
      
      document.body.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
      
      console.log(`💥 点击效果: (${x}, ${y})`);
    };

    // 轨迹动画循环
    const animateTrails = () => {
      if (isMouseInWindow) {
        trails.forEach((trail, index) => {
          const position = trailPositions[index];
          const opacity = (trails.length - index) / trails.length * 0.8;
          
          trail.style.left = `${position.x}px`;
          trail.style.top = `${position.y}px`;
          trail.style.opacity = opacity.toString();
        });
      }
      
      animationId = requestAnimationFrame(animateTrails);
    };

    // 添加CSS动画样式
    const addStyles = () => {
      if (!document.querySelector('#global-mouse-effects-styles')) {
        const style = document.createElement('style');
        style.id = 'global-mouse-effects-styles';
        style.textContent = `
          @keyframes mouseRipple {
            0% {
              width: 0;
              height: 0;
              opacity: 1;
            }
            100% {
              width: 100px;
              height: 100px;
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
    };

    // 初始化
    addStyles();

    // 绑定事件监听器
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });

    // 开始动画
    animateTrails();

    console.log('✅ 全局鼠标特效初始化完成');

    // 清理函数
    return () => {
      console.log('🧹 清理全局鼠标特效');
      
      // 移除事件监听器
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('click', handleClick);
      
      // 停止动画
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // 清理DOM元素
      cleanupExisting();
      
      // 清理样式
      const styles = document.querySelector('#global-mouse-effects-styles');
      if (styles) {
        styles.remove();
      }
    };
  }, [disabled, isMobile]);

  return null;
};

export default GlobalMouseEffects;
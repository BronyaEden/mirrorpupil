import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import styled from 'styled-components';
import Footer from './Footer';
import { ResponsiveContainer, MobileSidebar } from '../ResponsiveComponents';
import { useViewport } from '../../hooks/useResponsive';
import { mediaQuery } from '../../styles/responsive';

const { Content } = AntLayout;

const StyledLayout = styled(AntLayout)`
  min-height: 100vh;
  background: transparent;
  position: relative;
  
  /* 确保不影响Header的固定定位 */
  overflow-x: hidden;
`;

const StyledContent = styled(Content)`
  background: transparent;
  /* 为全局固定Header预留空间 */
  padding: 88px clamp(8px, 1vw, 16px) 24px clamp(8px, 1vw, 16px);
  flex: 1;
  min-height: 100vh;
  
  ${mediaQuery.mobile(`
    padding: 56px clamp(2px, 1vw, 6px) 56px clamp(2px, 1vw, 6px); /* 为顶部和底部导航栏预留空间 */
  `)}
  
  ${mediaQuery.lg(`
    padding: 96px clamp(12px, 1vw, 20px) 32px clamp(12px, 1vw, 20px); /* 大屏幕更大的间距 */
  `)}
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Layout: React.FC = () => {
  const { isMobile } = useViewport();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <StyledLayout>
      {/* 不再包含Header，由GlobalHeader全局管理 */}
      
      <StyledContent>
        <ResponsiveContainer>
          <MainContent>
            <Outlet />
          </MainContent>
        </ResponsiveContainer>
      </StyledContent>
      
      <Footer />
      
      {/* 移动端侧边栏 */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        position="left"
      >
        {/* 这里可以放置移动端导航菜单 */}
        <div style={{ padding: '20px' }}>
          <h3>移动端菜单</h3>
          {/* 可以添加导航项 */}
        </div>
      </MobileSidebar>
    </StyledLayout>
  );
};

export default Layout;
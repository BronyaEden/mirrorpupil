import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import { ResponsiveContainer, MobileSidebar } from '../ResponsiveComponents';
import { useViewport } from '../../hooks/useResponsive';
import { mediaQuery } from '../../styles/responsive';

const { Content } = AntLayout;

const StyledLayout = styled(AntLayout)`
  min-height: 100vh;
  background: transparent;
  position: relative;
`;

const StyledContent = styled(Content)`
  background: transparent;
  padding: 24px;
  flex: 1;
  
  ${mediaQuery.mobile(`
    padding: 16px;
  `)}
  
  ${mediaQuery.lg(`
    padding: 32px;
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
      <Header onMenuClick={handleSidebarToggle} />
      
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
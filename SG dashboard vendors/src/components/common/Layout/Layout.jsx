import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevents flex item from overflowing */
`;

const DashboardContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  min-height: 0;
`;

function Layout({ children }) {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <DashboardContent>
          {children}
        </DashboardContent>
      </MainContent>
    </LayoutContainer>
  );
}

export default Layout;
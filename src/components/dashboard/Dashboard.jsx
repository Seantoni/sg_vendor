import React, { useState } from 'react';
import styled from 'styled-components';
import Overview from './Overview/Overview';

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 100%;
`;

const SectionContainer = styled.section`
  display: ${props => props.active ? 'block' : 'none'};
`;

function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'users':
        return <div>User Analysis - Coming Soon</div>;
      case 'retention':
        return <div>Retention - Coming Soon</div>;
      case 'financial':
        return <div>Financial - Coming Soon</div>;
      case 'locations':
        return <div>Locations - Coming Soon</div>;
      case 'projections':
        return <div>Projections - Coming Soon</div>;
      case 'monitoring':
        return <div>Monitoring - Coming Soon</div>;
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardContainer>
      {renderSection()}
    </DashboardContainer>
  );
}

export default Dashboard;
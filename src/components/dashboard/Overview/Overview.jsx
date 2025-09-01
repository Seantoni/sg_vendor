import React from 'react';
import styled from 'styled-components';

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  text-align: center;
`;

const WelcomeTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #2d3436;
  font-size: 28px;
  font-weight: 700;
`;

const WelcomeText = styled.p`
  color: #636e72;
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const FeatureIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #2d3436;
  font-size: 18px;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: #636e72;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 12px;
  
  ${props => props.status === 'ready' && `
    background: #d4edda;
    color: #155724;
  `}
  
  ${props => props.status === 'migration' && `
    background: #fff3cd;
    color: #856404;
  `}
`;

const features = [
  {
    icon: '🎨',
    title: 'Modern UI',
    description: 'React + Styled Components with purple theme matching your current design',
    status: 'ready'
  },
  {
    icon: '📊',
    title: 'Chart System',
    description: 'Chart.js integration ready for your existing chart logic migration',
    status: 'ready'
  },
  {
    icon: '🔄',
    title: 'State Management',
    description: 'Context API setup for centralized data and filter management',
    status: 'ready'
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    description: 'Mobile-first design with collapsible sidebar and touch support',
    status: 'ready'
  },
  {
    icon: '⚡',
    title: 'Performance',
    description: 'Vite hot reload, component memoization, and optimized rendering',
    status: 'ready'
  },
  {
    icon: '🔐',
    title: 'Authentication',
    description: 'Ready to migrate your login system and session management',
    status: 'migration'
  }
];

function Overview() {
  return (
    <OverviewContainer>
      <WelcomeCard>
        <WelcomeTitle>🎉 React Migration - Step 1 Complete!</WelcomeTitle>
        <WelcomeText>
          Your dashboard foundation is ready. The React architecture is set up with modern patterns, 
          component structure, and all dependencies installed. Ready to migrate your 4,600+ lines 
          of vanilla JavaScript into clean, maintainable React components.
        </WelcomeText>
        
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <StatusBadge status={feature.status}>
                {feature.status === 'ready' ? '✅ Ready' : '🚧 Ready for Migration'}
              </StatusBadge>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </WelcomeCard>
    </OverviewContainer>
  );
}

export default Overview;
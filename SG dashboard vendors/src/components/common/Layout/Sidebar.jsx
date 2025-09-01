import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faUsers, 
  faUserCheck, 
  faDollarSign, 
  faMapMarkerAlt, 
  faChartBar, 
  faExclamationTriangle,
  faSignOutAlt,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../context/AppContext';

const SidebarContainer = styled.nav`
  width: 280px;
  background: linear-gradient(180deg, #6B64DB 0%, #8b7ed8 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2000;
  box-shadow: 4px 0 20px rgba(107, 100, 219, 0.15);
  transition: all 0.3s ease;

  ${props => props.collapsed && `
    width: 80px;
  `}

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 3000;
    
    ${props => props.open && `
      transform: translateX(0);
    `}
  }
`;

const SidebarHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const SidebarTitle = styled.span`
  font-size: 20px;
  font-weight: 700;
  ${props => props.collapsed && 'display: none;'}
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 24px 0;
`;

const SidebarSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
  margin-bottom: 16px;
  padding: 0 24px;
  ${props => props.collapsed && 'display: none;'}
`;

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MenuItem = styled.li`
  margin: 4px 12px;
`;

const MenuLink = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: white;
  text-align: left;
  padding: 16px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.active && `
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }
`;

const MenuIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuText = styled.span`
  ${props => props.collapsed && 'display: none;'}
`;

const SidebarUser = styled.div`
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  ${props => props.collapsed && 'justify-content: center;'}
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserName = styled.span`
  font-weight: 500;
  font-size: 14px;
  ${props => props.collapsed && 'display: none;'}
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  ${props => props.collapsed && 'display: none;'}
`;

const menuItems = [
  { id: 'overview', label: 'Resumen General', icon: faChartLine },
  { id: 'users', label: 'Análisis de Usuarios', icon: faUsers },
  { id: 'retention', label: 'Retención', icon: faUserCheck },
  { id: 'financial', label: 'Análisis Financiero', icon: faDollarSign },
  { id: 'locations', label: 'Análisis por Ubicación', icon: faMapMarkerAlt },
  { id: 'projections', label: 'Proyecciones', icon: faChartBar },
  { id: 'monitoring', label: 'Monitoreo', icon: faExclamationTriangle }
];

function Sidebar() {
  const { state, actions } = useAppContext();
  const [activeSection, setActiveSection] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // In mobile, close sidebar after selection
    if (window.innerWidth <= 768) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    actions.setAuth(false, '');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <SidebarContainer collapsed={collapsed} open={mobileOpen}>
      <SidebarHeader>
        <SidebarLogo>
          <LogoImage 
            src="https://oferta-uploads-prod.s3.us-east-1.amazonaws.com/pictures/others/SimpleGo/SGO_Marca_7.png?_t=1745530830"
            alt="SimpleGo Logo"
          />
          <SidebarTitle collapsed={collapsed}>Analytics</SidebarTitle>
        </SidebarLogo>
        <CollapseButton 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </CollapseButton>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSection>
          <SectionTitle collapsed={collapsed}>Navegación</SectionTitle>
          <MenuList>
            {menuItems.map((item) => (
              <MenuItem key={item.id}>
                <MenuLink
                  active={activeSection === item.id}
                  onClick={() => handleSectionChange(item.id)}
                >
                  <MenuIcon>
                    <FontAwesomeIcon icon={item.icon} />
                  </MenuIcon>
                  <MenuText collapsed={collapsed}>{item.label}</MenuText>
                </MenuLink>
              </MenuItem>
            ))}
          </MenuList>
        </SidebarSection>
      </SidebarContent>

      <SidebarUser collapsed={collapsed}>
        <UserInfo collapsed={collapsed}>
          <UserAvatar>
            <FontAwesomeIcon icon={faUsers} />
          </UserAvatar>
          <UserName collapsed={collapsed}>
            {state.userDisplayName}
          </UserName>
        </UserInfo>
        <LogoutButton 
          collapsed={collapsed}
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
        </LogoutButton>
      </SidebarUser>
    </SidebarContainer>
  );
}

export default Sidebar;
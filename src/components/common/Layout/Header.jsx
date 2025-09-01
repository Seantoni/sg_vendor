import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../context/AppContext';

const HeaderContainer = styled.header`
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #2d3436;
  
  &:hover {
    background: #f1f3f4;
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2d3436;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const LatestTransactionInfo = styled.div`
  font-size: 13px;
  color: #636e72;
`;

const CompactBusinessDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BusinessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BusinessName = styled.span`
  font-weight: 600;
  color: #2d3436;
  font-size: 14px;
`;

const FilterSummary = styled.span`
  font-size: 12px;
  color: #636e72;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #636e72;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #6B64DB;
  }
`;

function Header() {
  const { state } = useAppContext();
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const getBusinessDisplayName = () => {
    return state.selectedBusiness === 'all' ? 'Todos los Negocios' : state.selectedBusiness;
  };

  const getFilterSummary = () => {
    const filters = [];
    
    if (state.selectedLocation !== 'all') {
      filters.push(`📍 ${state.selectedLocation}`);
    }
    
    if (state.currentDateRange) {
      filters.push(`📅 ${state.currentDateRange}`);
    }
    
    return filters.join(' · ') || '';
  };

  return (
    <HeaderContainer>
      <HeaderLeft>
        <MobileMenuButton>
          <FontAwesomeIcon icon={faBars} size="lg" />
        </MobileMenuButton>
        <HeaderContent>
          <HeaderTitle>Panel de Análisis de Transacciones</HeaderTitle>
          <LatestTransactionInfo>
            Fecha más reciente: Cargando...
          </LatestTransactionInfo>
        </HeaderContent>
      </HeaderLeft>

      <CompactBusinessDisplay onClick={() => setFiltersExpanded(!filtersExpanded)}>
        <BusinessInfo>
          <BusinessName>{getBusinessDisplayName()}</BusinessName>
          <FilterSummary>{getFilterSummary()}</FilterSummary>
        </BusinessInfo>
        <ExpandButton>
          <FontAwesomeIcon icon={faChevronDown} />
        </ExpandButton>
      </CompactBusinessDisplay>
    </HeaderContainer>
  );
}

export default Header;
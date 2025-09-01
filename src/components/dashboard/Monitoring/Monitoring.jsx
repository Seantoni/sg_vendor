import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

function Monitoring() {
  return (
    <Container>
      <h2>Monitoreo de Transacciones</h2>
      <p>Sección de monitoreo - próximamente migrada desde vanilla JS.</p>
    </Container>
  );
}

export default Monitoring;

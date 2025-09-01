import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  color: #2d3436;
  font-size: 24px;
  font-weight: 700;
`;

const Description = styled.p`
  color: #636e72;
  margin: 0;
`;

function UserAnalysis() {
  return (
    <Container>
      <Title>Análisis de Usuarios</Title>
      <Description>
        Esta sección contendrá los gráficos de análisis de usuarios.
        Próximamente se migrarán los componentes de gráficos desde la versión vanilla JS.
      </Description>
    </Container>
  );
}

export default UserAnalysis;

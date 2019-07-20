import React from 'react';
import './App.css';
import styled from 'styled-components';
import ExplorerContainer from './containers/ExplorerContainer';
import InstanceViewerContainer from './containers/InstanceViewerContainer';
import GlobalInterpreterContainer from './containers/GlobalInterpreterContainer';

const Container = styled.div`
  width: 80%;
  margin: 10px auto;
  display: grid;
  grid-template-rows: 50px 500px 500px;
  grid-template-columns: 42.5% 15% 42.5%;
  grid-template-areas:
    'h h h'
    'e m2 g'
    'e m3 m';

  font-size: 0.9rem;
  font-family: sans-serif;
  color: #404040;
`;

const Header = styled.div`
  grid-area: h;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid darkgray;
  display: flex;
  align-items: center;
`;

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
`;

const Mockup = styled.div`
  grid-area: m;
`;

const Mockup2 = styled.div`
  grid-area: m2;
`;

const Mockup3 = styled.div`
  grid-area: m3;
`;

function App() {
  return (
    <Container className={Container}>
      <Header className={Header}>
        <Title class=".App-link">TRIBAL</Title>
      </Header>
      <ExplorerContainer />
      <Mockup2 />
      <GlobalInterpreterContainer />
      <Mockup3 />
      <Mockup />
    </Container>
  );
}

export default App;

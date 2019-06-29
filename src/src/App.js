import React from 'react';
import './App.css';
import styled from 'styled-components';
import CounterContainer from './containers/CounterContainer';
import RetrievalViewContainer from './containers/RetrievalViewContainer';
import './data/tweet_guncontrol.csv';

const Container = styled.div`
  width: 70%;
  margin: 10px auto;
  display: grid;
  grid-template-rows: 50px 500px 500px;
  grid-template-columns: 50% 50%;
  grid-template-areas:
    'h h'
    'rt m'
    'm2 m';

  font-size: 0.9rem;
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

function App() {
  return (
    <Container className={Container}>
      <Header className={Header}>
        <Title class=".App-link">TRIBAL</Title>
      </Header>
      <RetrievalViewContainer />
      <CounterContainer />
      <Mockup />
      <Mockup2 />
    </Container>
  );
}

export default App;

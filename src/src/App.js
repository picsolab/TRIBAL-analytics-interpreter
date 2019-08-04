import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './App.css';
import styled from 'styled-components';

import { fetchTweets, runDT } from './modules/tweet';
import { runClustering } from './modules/cluster';
import { calculatePartialDependence } from './modules/globalInterpreter';

import ExplorerContainer from './containers/ExplorerContainer';
import GlobalInterpreterContainer from './containers/GlobalInterpreterContainer';
import LocalInterpreterContainer from './containers/LocalInterpreterContainer';

const Container = styled.div`
  width: 80%;
  margin: 10px auto;
  display: grid;
  grid-template-rows: 50px 500px 500px;
  grid-template-columns: 42.5% 2.5% 55%;
  grid-template-areas:
    'h h h'
    'e m2 g'
    'e m3 l';

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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTweets());
  });

  return (
    <Container className={Container}>
      <Header className={Header}>
        <Title className=".App-link">TRIBAL</Title>
      </Header>
      <ExplorerContainer />
      <Mockup2 />
      <GlobalInterpreterContainer />
      <LocalInterpreterContainer />
      <Mockup3 />
      <Mockup />
    </Container>
  );
}

export default App;

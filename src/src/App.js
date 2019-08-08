import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './App.css';
import styled from 'styled-components';

import { fetchTweets, runDT } from './modules/tweet';
import { fetchUsers } from './modules/user';
import { SectionTitle, SectionWrapper } from './GlobalStyles';

import ExplorerContainer from './containers/ExplorerContainer';
import GlobalInterpreterContainer from './containers/GlobalInterpreterContainer';
import LocalInterpreterContainer from './containers/LocalInterpreterContainer';
import GroupViewerContainer from './containers/GroupViewerContainer';
import InstanceViewerContainer from './containers/InstanceViewerContainer';

const Container = styled.div`
  width: 85%;
  margin: 10px auto;
  display: grid;
  grid-template-rows: 50px 600px 500px;
  grid-template-columns: 32.5% 17.5% 50%;
  grid-template-areas:
    'h h h'
    'e gr g'
    'e i l';

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

const Mockup3 = styled.div`
  grid-area: m3;
`;

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTweets());
    dispatch(fetchUsers());
  });

  return (
    <Container className={Container}>
      <Header className={Header}>
        <Title className=".App-link">TRIBAL</Title>
      </Header>
      <ExplorerContainer />
      <GroupViewerContainer />
      <InstanceViewerContainer />
      <GlobalInterpreterContainer />
      <LocalInterpreterContainer />
      <Mockup3 />
      <Mockup />
    </Container>
  );
}

export default App;

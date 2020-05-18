import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import 'antd/dist/antd.css';
import './App.css';
// import './index.css';
import styled from 'styled-components';

import {fetchTweets, fetchSeqs} from './modules/tweet';
import {fetchUsers} from './modules/user';
import {runDT} from './modules/globalInterpreter';

import {Button} from 'antd';
import {SectionTitle, SectionWrapper, globalColors} from './GlobalStyles';

import ExplorerContainer from './containers/ExplorerContainer';
import GlobalInterpreterContainer from './containers/GlobalInterpreterContainer';
import LocalInterpreterContainer from './containers/LocalInterpreterContainer';
import GroupViewerContainer from './containers/GroupViewerContainer';
import InstanceViewerContainer from './containers/InstanceViewerContainer';
import ResultViewContainer from './containers/ResultViewContainer';

const Container = styled.div`
  width: 80%;
  margin: 10px auto;
  display: grid;
  grid-template-rows: 50px 900px 450px;
  grid-template-columns: 15% 12.5% 70%;
  grid-template-areas:
    'h h h'
    'e g g'
    'e l l';

  font-size: 0.9rem;
  font-family: sans-serif;
  color: #404040;
  // background-color: whitesmoke;
`;

const Header = styled.div`
  grid-area: h;
  width: 100%;
  height: 50px;
  // border-bottom: 1px solid darkgray;
  display: flex;
  align-items: center;
  // background-color: ${globalColors.feature};
  padding-left: 15px;
`;

const Title = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: black;
`;

const Mockup = styled.div`
  grid-area: m;
`;

const Mockup3 = styled.div`
  grid-area: m3;
`;

const issues = ['Gun control', 'Abortion'];
const datasets = ['Tweets'];

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTweets());
    dispatch(fetchUsers());
  });

  return (
    <Container className={Container}>
      <Header className={Header} style={{display: 'flex'}}>
        <Title className=".App-link">TRIBAL&nbsp;
          <span style={{ 
            'font-size': '1.5rem',
            'color': 'white' 
            }}>Group Contrast Viewer</span>
        </Title>
        {/* <Button
          href="https://docs.google.com/document/d/13oREBJCSthiAUS7uHgkxLXqRIYekNfBvzN_Snt9lIKY/edit?usp=sharing"
          target="_blank"
          type="primary"
          size={'small'}
          style={{ marginLeft: 'auto' }}
        >
          Feedbacks
        </Button> */}
      </Header>
      <ExplorerContainer />
      {/* <GroupViewerContainer /> */}
      {/* <InstanceViewerContainer /> */}
      <GlobalInterpreterContainer />
      <LocalInterpreterContainer />
      {/* <ResultViewContainer /> */}
      <Mockup3 />
      <Mockup />
    </Container>
  );
}

export default App;

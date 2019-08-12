import React, { useDispatch } from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import CustomizedInputBase from '../subcomponents/SearchBar';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionTitle, SubTitle } from '../../GlobalStyles';

import RetrievalView from './RetrievalView';
import DocumentView from './DocumentView';
import ListView from './ListView';

const ExplorerWrapper = styled.div.attrs({
  className: 'Explorer'
})`
  grid-area: e;
  display: grid;
  grid-template-rows: 150px 300px 650px;
  grid-template-columns: 60% 40%;
  grid-template-areas:
    'rt rt'
    'd l'
    'd l';
`;

const Explorer = ({ tweets, tweetList, users, userList, selectedTweet }) => {
  // const dispatch = useDispatch();
  console.log('tweets in explorer: ', tweets, users);

  return (
    <ExplorerWrapper>
      <RetrievalView tweets={tweets} />
      <DocumentView tweetList={tweetList} selectedTweet={selectedTweet} />
      <ListView userList={userList} />
    </ExplorerWrapper>
  );
};

export default Explorer;

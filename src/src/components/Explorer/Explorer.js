import React, {useDispatch} from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import {Button} from 'grommet';
import CustomizedInputBase from '../subcomponents/SearchBar';
import index from '../../index.css';
import {StylesContext} from '@material-ui/styles/StylesProvider';
import {SectionTitle, SubTitle} from '../../GlobalStyles';

import RetrievalView from './RetrievalView';
import DocumentView from './DocumentView';
import ListView from './ListView';

const ExplorerWrapper = styled.div.attrs({
  className: 'explorer_wrapper'
})`
  grid-area: e;
  display: grid;
  grid-template-rows: 100px 800px 300px;
  grid-template-columns: 100%;
  grid-template-areas:
    'rt'
    'd'
    'l';
  background-color: whitesmoke;
  // border-right: solid 1px lightgray;
`;

const Explorer = ({
  tweets, 
  tweetList, 
  filteredTweetList, 
  users, 
  userList, 
  selectedUser, 
  selectedTweet,
  features
}) => {
  // const dispatch = useDispatch();
  const numRetrievedTweets = tweetList.length;

  return (
    <ExplorerWrapper>
      <RetrievalView tweets={tweets} numRetrievedTweets={numRetrievedTweets} />
      <DocumentView
        tweetList={Object.keys(selectedUser).length === 0 ? tweetList : filteredTweetList}
        selectedTweet={selectedTweet}
        features={features}
      />
      <ListView userList={userList} selectedUser={selectedUser} />
    </ExplorerWrapper>
  );
};

export default Explorer;

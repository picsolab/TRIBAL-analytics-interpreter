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
  className: 'explorer_wrapper'
})`
  grid-area: e;
  display: grid;
  grid-template-rows: 150px 300px 650px;
  grid-template-columns: 60% 40%;
  grid-template-areas:
    'rt rt'
    'd l'
    'd l';
  background-color: whitesmoke;
`;

const Explorer = ({
  tweets,
  tweetList,
  filteredTweetList,
  users,
  userList,
  selectedUser,
  selectedTweet
}) => {
  // const dispatch = useDispatch();
  console.log('tweets in explorer: ', tweets, users, selectedTweet);
  const numRetrievedTweets = tweetList.length;

  return (
    <ExplorerWrapper>
      <RetrievalView tweets={tweets} numRetrievedTweets={numRetrievedTweets} />
      <DocumentView
        tweetList={
          Object.keys(selectedUser).length === 0 ? tweetList : filteredTweetList
        }
        selectedTweet={selectedTweet}
      />
      <ListView userList={userList} selectedUser={selectedUser} />
    </ExplorerWrapper>
  );
};

export default Explorer;

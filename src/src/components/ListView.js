import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import CustomizedInputBase from './SearchBar';
import index from '../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
  ComponentSubTitle,
  SubTitle,
  SubTitle2,
  DocumentWrapper,
  GroupDiv,
  ContentDiv,
  ScoreDiv
} from '../GlobalStyles';

import FeatureView from './FeatureView';

const ListViewWrapper = styled.div.attrs({
  className: 'list_view_wrapper'
})`
  display: grid;
  grid-template-rows: 50% 50%;
  grid-template-columns: 20% 50% 30%;
  grid-template-areas:
    'f dc u'
    'f dc w';
  height: 67.5%;
  border-bottom: 1px solid lightgray;
`;

const DocumentListWrapper = styled(SubTitle2).attrs({
  className: 'document_list'
})`
  grid-area: dc;
  border
`;

const UserListWrapper = styled(SubTitle2).attrs({
  className: 'user_list'
})`
  grid-area: u;
`;

const WordListWrapper = styled(SubTitle2).attrs({
  className: 'word_list'
})`
  grid-area: w;
`;

const DocumentView = ({ tweet }) => {
  console.log(tweet);
  return (
    <DocumentWrapper>
      <GroupDiv>{tweet.grp}</GroupDiv>
      <div>
        <ContentDiv>{tweet.content}</ContentDiv>
        <div style={{ display: 'flex' }}>
          <ScoreDiv>{'V: ' + Math.round(tweet.valence * 100) / 100}</ScoreDiv>
          <ScoreDiv>{'A: ' + Math.round(tweet.arousal * 100) / 100}</ScoreDiv>
          <ScoreDiv>{'D: ' + Math.round(tweet.dominance * 100) / 100}</ScoreDiv>
        </div>
      </div>
    </DocumentWrapper>
  );
};

const DocumentListView = ({ tweets }) => {
  const top10Tweets = tweets.slice(0, 3);

  return top10Tweets.map(tweet => {
    return <DocumentView tweet={tweet} />;
  });
};

const UserView = ({ user }) => {
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div>{user.screenName}</div>
        <div>{user.content}</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div>{'V: ' + Math.round(0.24 * 100) / 100}</div>
        <div>{'A: ' + Math.round(0.38 * 100) / 100}</div>
        <div>{'D: ' + Math.round(0.23 * 100) / 100}</div>
      </div>
    </div>
  );
};

const UserListView = ({ tweets }) => {
  const top10Tweets = tweets.slice(0, 3);
  const userData = top10Tweets.map(tweet => {
    return {
      userId: tweet.user_id,
      screenName: tweet.screen_name,
      numFollower: tweet.num_followers,
      numFriends: tweet.num_friends,
      numRetweeted: tweet.num_retweeted
    };
  });

  return userData.map(user => <UserView user={user} />);
};

const ListView = ({ data }) => {
  const mockup = [0.7, 0.5, 0.3, 0.4];
  console.log('data in ListView: ', data);

  return (
    <ListViewWrapper>
      <FeatureView data={mockup} />
      <DocumentListWrapper>
        <ComponentSubTitle>Document</ComponentSubTitle>
        <DocumentListView tweets={data} />
      </DocumentListWrapper>
      <UserListWrapper>
        <ComponentSubTitle>User</ComponentSubTitle>
        <UserListView tweets={data} />
      </UserListWrapper>
      <WordListWrapper>
        <ComponentSubTitle>Word</ComponentSubTitle>
      </WordListWrapper>
    </ListViewWrapper>
  );
};

export default ListView;

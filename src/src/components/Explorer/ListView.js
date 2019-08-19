import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import { Button, InfiniteScroll } from 'grommet';
import {
  globalColors,
  SectionWrapper,
  ComponentSubTitle,
  SubsectionTitle,
  SubTitle,
  SubTitle2,
  ListViewStyle
} from '../../GlobalStyles';

import User from '../subcomponents/User';

const ListViewWrapper = styled(SectionWrapper).attrs({
  className: 'list_view_wrapper'
})`
  grid-area: l;
`;

const UserListWrapper = styled(ListViewStyle).attrs({
  className: 'user_list'
})`
  grid-area: u;
  height: 85%;
  margin-right: 5px;
  overflow-y: scroll;
`;

const WordListWrapper = styled(ListViewStyle).attrs({
  className: 'word_list'
})`
  grid-area: w;
  height: 90%;
  height: 85%;
  margin-right: 5px;
  overflow-y: scroll;
`;

const layout = {
  userScoreView: {
    width: 40,
    height: 35,
    marginBottom: 10,
    svg: {
      width: 40,
      height: 35
    }
  }
};

const UserAvgScoreView = props => {
  const {
    avgUserScores,
    yNumFollowersScale,
    yNumFreindsScale,
    yNumRetweetedScale,
    yNumTweetsScale
  } = props;

  const ref = useRef(null);

  const xFeatureScale = d3
    .scaleBand()
    .domain(d3.range(avgUserScores.length))
    .range([0, layout.userScoreView.svg.width]);

  const yScoreScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([
      layout.userScoreView.svg.height - layout.userScoreView.marginBottom,
      0
    ]);

  useEffect(() => {
    // Use avgScores up there temporarily
    const { users } = props;
    const userFeatures = [
        'numFollowers',
        'numFreinds',
        'numRetweeted',
        'numTweets'
      ],
      numScores = avgUserScores.length;

    const featureRecData = d3
      .select(ref.current)
      .selectAll('.feature_rect')
      .data(avgUserScores);

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.userScoreView.svg.width / numScores - 3)
      .attr('height', (d, i) => {
        if (i === 0) return yNumFollowersScale(d);
        else if (i === 1) return yNumFreindsScale(d);
        else if (i === 2) return yNumRetweetedScale(d);
        else if (i === 3) return yNumTweetsScale(d);
      })
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => {
        if (i === 0)
          return (
            layout.userScoreView.svg.height -
            layout.userScoreView.marginBottom -
            yNumFollowersScale(d)
          );
        else if (i === 1)
          return (
            layout.userScoreView.svg.height -
            layout.userScoreView.marginBottom -
            yNumFreindsScale(d)
          );
        else if (i === 2)
          return (
            layout.userScoreView.svg.height -
            layout.userScoreView.marginBottom -
            yNumRetweetedScale(d)
          );
        else if (i === 3)
          return (
            layout.userScoreView.svg.height -
            layout.userScoreView.marginBottom -
            yNumTweetsScale(d)
          );
      })
      .style('fill', globalColors.userFeature);

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(['F', 'F', 'R', 'T'])
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => layout.userScoreView.svg.height)
      .style('font-size', '0.6rem');
  }, [props.tweets, ref.current]);

  return (
    <div
      style={{
        width: layout.userScoreView.width,
        height: layout.userScoreView.height,
        marginLeft: 'auto'
      }}
    >
      <svg width="100%" height="100%" ref={ref} />
    </div>
  );
};

const UserListView = ({ userList, selectedUser }) => {
  const numFollowersData = userList.map(d => d.numFollowers),
    numFriendsData = userList.map(d => d.numFriends),
    numRetweetedData = userList.map(d => d.numRetweeted),
    numTweetsData = userList.map(d => d.numTweets);

  const avgUserScores = [
    _.mean(numFollowersData),
    _.mean(numFriendsData),
    _.mean(numRetweetedData),
    _.mean(numTweetsData)
  ];

  // Calculate the global scale of user scores
  const yNumFollowersScale = d3
    .scaleLinear()
    .domain(d3.extent(numFollowersData))
    .range([
      layout.userScoreView.svg.height - layout.userScoreView.marginBottom,
      0
    ]);

  const yNumFreindsScale = d3
    .scaleLinear()
    .domain(d3.extent(numFriendsData))
    .range([
      layout.userScoreView.svg.height - layout.userScoreView.marginBottom,
      0
    ]);

  const yNumRetweetedScale = d3
    .scaleLinear()
    .domain(d3.extent(numRetweetedData))
    .range([
      layout.userScoreView.svg.height - layout.userScoreView.marginBottom,
      0
    ]);

  const yNumTweetsScale = d3
    .scaleLinear()
    .domain(d3.extent(numTweetsData))
    .range([
      layout.userScoreView.svg.height - layout.userScoreView.marginBottom,
      0
    ]);

  return (
    <div>
      <UserAvgScoreView
        users={userList}
        avgUserScores={avgUserScores}
        yNumFollowersScale={yNumFollowersScale}
        yNumFreindsScale={yNumFreindsScale}
        yNumRetweetedScale={yNumRetweetedScale}
        yNumTweetsScale={yNumTweetsScale}
      />
      <InfiniteScroll items={userList} step={10}>
        {item => (
          <User
            user={item}
            isSelected={
              !selectedUser || Object.keys(selectedUser).length === 0
                ? false
                : item.screenName === selectedUser.screenName
                ? true
                : false
            }
            yNumFollowersScale={yNumFollowersScale}
            yNumFreindsScale={yNumFreindsScale}
            yNumRetweetedScale={yNumRetweetedScale}
            yNumTweetsScale={yNumTweetsScale}
          />
        )}
      </InfiniteScroll>
    </div>
  );
};

const ListView = ({ userList, selectedUser }) => {
  if (!userList || userList.length === 0) return <div />;

  return (
    <ListViewWrapper>
      <div style={{ height: '50%' }}>
        <SubsectionTitle>User</SubsectionTitle>
        <UserListWrapper>
          <UserListView userList={userList} selectedUser={selectedUser} />
        </UserListWrapper>
      </div>
      {/* <div style={{ height: '50%' }}>
        <SubsectionTitle>Word</SubsectionTitle>
        <WordListWrapper>
          <UserListView userList={userList} />
        </WordListWrapper>
      </div> */}
    </ListViewWrapper>
  );
};

export default ListView;

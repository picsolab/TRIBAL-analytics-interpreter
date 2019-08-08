import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import { Button } from 'grommet';
import {
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
  height: 90%;
  margin-right: 5px;
  overflow-y: scroll;
`;

const WordListWrapper = styled(ListViewStyle).attrs({
  className: 'word_list'
})`
  grid-area: w;
  height: 90%;
`;

const layout = {
  userScoreView: {
    width: 50,
    height: 35,
    marginBottom: 10,
    svg: {
      width: 50,
      height: 35
    }
  }
};

const UserAvgScoreView = props => {
  const {
    avgUserScores,
    yNumFollowersScale,
    yNumFreindsScale,
    yNumRetweetedScale
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
    const userScores = _.pick(users, [
      'numFollowers',
      'numFreinds',
      'numRetweeted'
    ]);

    const featureRecData = d3
      .select(ref.current)
      .selectAll('.feature_rect')
      .data(avgUserScores);

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.userScoreView.svg.width / 3 - 5)
      .attr('height', (d, i) => {
        if (i === 0) return yNumFollowersScale(d);
        else if (i === 1) return yNumFreindsScale(d);
        else if (i === 2) return yNumRetweetedScale(d);
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
      })
      .style('fill', 'green');

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(['F', 'F', 'R'])
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

const UserListView = ({ users }) => {
  const numFollowersData = users.map(d => d.numFollowers),
    numFriendsData = users.map(d => d.numFriends),
    numRetweetedData = users.map(d => d.numRetweeted);

  const avgUserScores = [
    _.mean(numFollowersData),
    _.mean(numFriendsData),
    _.mean(numRetweetedData)
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

  return (
    <div>
      <UserAvgScoreView
        users={users}
        avgUserScores={avgUserScores}
        yNumFollowersScale={yNumFollowersScale}
        yNumFreindsScale={yNumFreindsScale}
        yNumRetweetedScale={yNumRetweetedScale}
      />
      {users.map(function(user) {
        console.log('check yscale: ', yNumFollowersScale);
        return (
          <User
            user={user}
            yNumFollowersScale={yNumFollowersScale}
            yNumFreindsScale={yNumFreindsScale}
            yNumRetweetedScale={yNumRetweetedScale}
          />
        );
      })}
    </div>
  );
};

const ListView = ({ users }) => {
  console.log('data in ListView: ', users);

  return (
    <ListViewWrapper>
      <div style={{ height: '40%' }}>
        <SubsectionTitle>User</SubsectionTitle>
        <UserListWrapper>
          <UserListView users={users} />
        </UserListWrapper>
      </div>
      <div style={{ height: '40%' }}>
        <ComponentSubTitle>Word</ComponentSubTitle>
        <WordListWrapper />
      </div>
    </ListViewWrapper>
  );
};

export default ListView;

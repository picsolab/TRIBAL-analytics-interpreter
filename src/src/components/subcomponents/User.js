import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import { grommet } from 'grommet/themes';
import { globalColors } from '../../GlobalStyles';

const GroupDiv = styled.div.attrs({
  className: 'group'
})`
  width: 10px;
  height: 10px;
  line-height: 5;
  margin-right: 5px;
  border: 1px solid black;
  color: white;
  font-weight: 500;
  text-align: center;

  ${({ group }) =>
    group === 'lib'
      ? `background-color: ` + globalColors.group.lib
      : `background-color: ` + globalColors.group.con}
`;

const ScoreDiv = styled.div.attrs({
  className: 'score'
})``;

const DocDiv = styled.div.attrs({
  className: 'group'
})`
  width: 8px;
  height: 8px;
  line-height: 5;
  margin-right: 1px;
  // border: 1px solid black;
  color: white;
  font-weight: 500;
  text-align: center;

  ${({ group }) =>
    group === 'lib'
      ? `background-color: ` + globalColors.group.lib
      : `background-color: ` + globalColors.group.con}
`;

const ContentDiv = styled.div.attrs({
  className: 'content'
})`
  width: 100%;
  padding: 3px;
  font-size: 0.8rem;
`;

const UserWrapper = styled.div.attrs({
  className: 'document'
})`
  border: 1px solid black;
  padding: 3px;
  margin: 5px 0;
  border: 0.5px solid #dad9d9;
  background-color: white;
`;

const UserScoreView = props => {
  const ref = useRef(null);
  const dispatch = useDispatch();
  const layout = {
    width: 50,
    height: 35,
    marginBottom: 10,
    svg: {
      width: 50,
      height: 35
    }
  };

  const {
    user,
    yNumFollowersScale,
    yNumFreindsScale,
    yNumRetweetedScale
  } = props;

  const userScores = _.pick(user, [
    'numFollowers',
    'numFriends',
    'numRetweeted'
  ]);
  const userScoreValues = Object.values(userScores),
    numUserScores = userScoreValues.length;

  const xFeatureScale = d3
    .scaleBand()
    .domain(d3.range(numUserScores))
    .range([0, layout.svg.width]);

  const yScoreScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([layout.svg.height, 0]);

  useEffect(() => {
    const featureRecData = d3
      .select(ref.current)
      .selectAll('.feature_rect')
      .data(userScoreValues);

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.svg.width / numUserScores - 5)
      .attr('height', (d, i) => {
        if (i === 0) return yNumFollowersScale(d);
        else if (i === 1) return yNumFreindsScale(d);
        else if (i === 2) return yNumRetweetedScale(d);
      })
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => {
        if (i === 0)
          return (
            layout.svg.height - layout.marginBottom - yNumFollowersScale(d)
          );
        else if (i === 1)
          return layout.svg.height - layout.marginBottom - yNumFreindsScale(d);
        else if (i === 2)
          return (
            layout.svg.height - layout.marginBottom - yNumRetweetedScale(d)
          );
      })
      .style('fill', globalColors.userFeature);

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(['F', 'F', 'R'])
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => layout.svg.height)
      .style('font-size', '0.6rem');
  }, [props, ref.current]);

  return (
    <div
      style={{
        width: layout.width,
        height: layout.height,
        marginLeft: 'auto',
        marginTop: '5px'
      }}
    >
      <svg width="100%" height="100%" ref={ref} />
    </div>
  );
};

const User = ({
  user,
  yNumFollowersScale,
  yNumFreindsScale,
  yNumRetweetedScale
}) => {
  if (typeof user === 'undefined' || Object.keys(user).length === 0)
    return <div />;

  return (
    <UserWrapper>
      <div style={{ display: 'flex', height: 30, alignItems: 'center' }}>
        <GroupDiv group={user.group} />
        <div>{user.screenName}</div>
        <UserScoreView
          user={user}
          yNumFollowersScale={yNumFollowersScale}
          yNumFreindsScale={yNumFreindsScale}
          yNumRetweetedScale={yNumRetweetedScale}
        />
      </div>
      <div style={{ display: 'flex' }}>
        {['lib', 'con', 'lib'].map(group => (
          <DocDiv group={group} />
        ))}
      </div>
    </UserWrapper>
  );
};

export default User;

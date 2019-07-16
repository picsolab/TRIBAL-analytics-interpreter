import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import { grommet } from 'grommet/themes';

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
    group === 'lib' ? `background-color: skyblue;` : `background-color: pink`}
`;

const ScoreDiv = styled.div.attrs({
  className: 'score'
})``;

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

const ScoreView = props => {
  const ref = useRef(null);
  const layout = {
    width: 70,
    height: 30,
    svg: {
      width: 70,
      height: 25
    }
  };
  const xFeatureScale = d3
    .scaleBand()
    .domain(d3.range(6))
    .range([0, layout.svg.width]);

  const yScoreScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([layout.svg.height, 0]);

  useEffect(() => {
    const { tweet } = props;
    const tweetScores = _.pick(tweet, [
      'valence',
      'arousal',
      'dominance',
      'moral1',
      'moral2',
      'moral3'
    ]);

    const featureRecData = d3
      .select(ref.current)
      .selectAll('.feature_rect')
      .data(Object.values(tweetScores));

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.svg.width / 5 - 5)
      .attr('height', d => yScoreScale(d))
      .attr('x', (d, i) => {
        console.log('i: ', i);
        console.log('x position: ', xFeatureScale(i));
        return xFeatureScale(i);
      })
      .attr('y', (d, i) => layout.svg.height - yScoreScale(d))
      .style('fill', 'mediumpurple');

    // const featureTitle = d3
    //   .select(ref.current)
    //   .selectAll('text')
    //   .data(['R', 'A', 'D', 'M'])
    //   .enter()
    //   .append('text')
    //   .text(d => d)
    //   .attr('x', 10)
    //   .attr('y', (d, i) => i * 25 + 45);
  }, [props.tweet, ref.current]);

  return (
    <div
      style={{ width: layout.width, height: layout.height, marginLeft: 'auto' }}
    >
      <svg width="100%" height="100%" ref={ref} />
    </div>
  );
};

const User = ({ user }) => {
  if (typeof user === 'undefined' || Object.keys(user).length === 0)
    return <div />;

  return (
    <UserWrapper>
      <div style={{ display: 'flex', height: 30, alignItems: 'center' }}>
        <GroupDiv group={user.group} />
        <div>{user.user_id}</div>
        <ScoreView tweet={user} />
      </div>
      <ContentDiv>
        {
          "A singer killed at a meet &amp; greet, and then 50 people are murdered at a nightclub and yet some people still think we don't need gun control"
        }
      </ContentDiv>
    </UserWrapper>
  );
};

export default User;

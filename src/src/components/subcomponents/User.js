import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import { grommet } from 'grommet/themes';
import { globalColors } from '../../GlobalStyles';

const UserGlyph = styled.div.attrs({
  className: 'group'
})`
  width: 10px;
  height: 10px;
  line-height: 5;
  margin-right: 5px;
  border: 1px solid black;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  text-align: center;
  opacity: 0.5;

  ${({ group }) =>
    group === '1'
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
    group === '1'
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
    width: 40,
    height: 30,
    marginBottom: 10,
    svg: {
      width: 40,
      height: 25
    }
  };

  const {
    user,
    yNumFollowersScale,
    yNumFreindsScale,
    yNumRetweetedScale,
    yNumTweetsScale
  } = props;

  const userScores = _.pick(user, [
    'numFollowers',
    'numFriends',
    'numRetweeted',
    'numTweets'
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
      .attr('width', layout.svg.width / numUserScores - 3)
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
            layout.svg.height - layout.marginBottom - yNumFollowersScale(d)
          );
        else if (i === 1)
          return layout.svg.height - layout.marginBottom - yNumFreindsScale(d);
        else if (i === 2)
          return (
            layout.svg.height - layout.marginBottom - yNumRetweetedScale(d)
          );
        else if (i === 3)
          return layout.svg.height - layout.marginBottom - yNumTweetsScale(d);
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
  isSelected,
  yNumFollowersScale,
  yNumFreindsScale,
  yNumRetweetedScale,
  yNumTweetsScale
}) => {
  const dispatch = useDispatch();
  if (typeof user === 'undefined' || Object.keys(user).length === 0)
    return <div />;

  return (
    <UserWrapper>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <UserGlyph
          group={user.group}
          onClick={e => {
            if (isSelected) {
              d3.select(e.target).classed('user_glyph_selected', false);

              dispatch({
                type: 'SELECT_USER',
                payload: {}
              });
            } else {
              // Cancel all effects
              d3.selectAll('.user_glyph_selected').classed(
                '.user_glyph_selected',
                false
              );

              // Adjust the effect to the selected user
              d3.select(e.target).classed('user_glyph_selected', true);

              dispatch({
                type: 'SELECT_USER',
                payload: user
              });

              dispatch({
                type: 'FILTER_TWEETLIST_BY_USER',
                payload: user
              });
            }
          }}
        />
        <div style={{ width: '80%', fontSize: '0.75rem' }}>
          {user.screenName}
        </div>
        {/* <div style={{ display: 'flex' }}>
          {[1, 0, 1].map(group => (
            <DocDiv group={group} />
          ))}
        </div> */}
        <UserScoreView
          user={user}
          yNumFollowersScale={yNumFollowersScale}
          yNumFreindsScale={yNumFreindsScale}
          yNumRetweetedScale={yNumRetweetedScale}
          yNumTweetsScale={yNumTweetsScale}
        />
      </div>
    </UserWrapper>
  );
};

export default User;

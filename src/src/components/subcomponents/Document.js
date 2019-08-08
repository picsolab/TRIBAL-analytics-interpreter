import React, { useRef, useEffect } from 'react';
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

  opacity: 0.5;
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

const DocumentWrapper = styled.div.attrs({
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
        return xFeatureScale(i);
      })
      .attr('y', (d, i) => layout.svg.height - yScoreScale(d))
      .style('fill', globalColors.feature);
  }, [props.tweet, ref.current]);

  return (
    <div
      style={{ width: layout.width, height: layout.height, marginLeft: 'auto' }}
    >
      <svg width="100%" height="100%" ref={ref} />
    </div>
  );
};

const Document = props => {
  const { tweet } = props;
  const dispatch = useDispatch();
  if (typeof tweet === 'undefined' || Object.keys(tweet).length === 0)
    return <div />;

  return (
    <DocumentWrapper>
      <div
        style={{ display: 'flex', height: 30, alignItems: 'center' }}
        onClick={() =>
          dispatch({
            type: 'SELECT_TWEET',
            payload: tweet
          })
        }
      >
        <GroupDiv group={tweet.group} />
        <div>{tweet.screenName}</div>
        <ScoreView tweet={tweet} />
      </div>
      <ContentDiv>{tweet.content}</ContentDiv>
    </DocumentWrapper>
  );
};

export default Document;

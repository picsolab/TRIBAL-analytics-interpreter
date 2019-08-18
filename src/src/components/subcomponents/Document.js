import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import { grommet } from 'grommet/themes';
import { globalColors } from '../../GlobalStyles';

const GroupDiv = styled.div.attrs({
  className: 'doc_glyph'
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
    group === '1'
      ? `background-color: ` + globalColors.group.lib
      : `background-color: ` + globalColors.group.con}

  opacity: 0.5;
  cursor: pointer;
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
  className: 'doc_wrapper'
})`
  border: 1px solid black;
  padding: 3px;
  margin: 5px 0;
  border: 0.5px solid #dad9d9;
  background-color: white;
`;

const ScoreView = ({ tweet }) => {
  const ref = useRef(null);
  const features = ['valence', 'dominance', 'harm', 'fairness'],
    numFeatures = features.length,
    tweetScores = Object.values(_.pick(tweet, features));

  const layout = {
    width: 40,
    height: 30,
    svg: {
      width: 40,
      height: 25
    }
  };

  var xFeatureScale = d3.scaleBand().range([0, layout.svg.width]);

  var yScoreScale = d3
    .scaleLinear()
    .domain([1, 0])
    .range([layout.svg.height, 0]);

  const yHarmScale = d3
    .scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range([layout.svg.width, 0]);

  useEffect(() => {
    const svg = d3.select(ref.current);
    const featureRecData = svg
      // .append('g')
      // .attr('class', 'g_score')
      .selectAll('.feature_rect')
      .data(tweetScores);
    console.log('updated scoreview data: ', Object.values(tweetScores));
    console.log('before exit and remove: ', featureRecData);

    xFeatureScale.domain(d3.range(numFeatures));

    featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.svg.width / numFeatures - 3)
      .attr('height', (d, i) => (i === 2 ? yHarmScale(d) : yScoreScale(d)))
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) =>
        i === 2
          ? layout.svg.height - yHarmScale(d)
          : layout.svg.height - yScoreScale(d)
      )
      .style('fill', globalColors.feature);

    featureRecData
      .attr('width', layout.svg.width / numFeatures - 3)
      .attr('height', (d, i) => (i === 2 ? yHarmScale(d) : yScoreScale(d)))
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) =>
        i === 2
          ? layout.svg.height - yHarmScale(d)
          : layout.svg.height - yScoreScale(d)
      );
    featureRecData.exit().remove();
    console.log('after exit and remove: ', featureRecData);
  }, [tweet, ref.current]);

  return (
    <div
      style={{ width: layout.width, height: layout.height, marginLeft: 'auto' }}
    >
      <svg width="100%" height="100%" ref={ref} />
    </div>
  );
};

const Document = props => {
  const { tweet, isSelected } = props;
  const dispatch = useDispatch();
  if (typeof tweet === 'undefined' || Object.keys(tweet).length === 0)
    return <div />;
  return (
    <DocumentWrapper
      className={'doc_' + tweet.group + (isSelected ? ' doc_selected ' : '')}
      // style={isSelected ? { backgroundColor: '#dad9d9' } : {}}
    >
      <div
        className={'doc_' + tweet.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <GroupDiv
          // style={{ borderWidth:  }}
          group={tweet.group}
          style={isSelected ? { opacity: 1 } : {}}
          onClick={e => {
            const classList = e.target.className.split(' ');
            const isSelected =
              classList.filter(d => d === 'selected').length !== 0;

            if (isSelected) {
              // to unselect
              d3.select(e.target)
                .style('border-width', '0px')
                .style('opacity', 0.5);
            } else {
              // to encode the selection

              // Cancel all effects
              d3.selectAll('.doc_glyph')
                .classed('.doc_glyph_selected', false)
                .style('opacity', 0.5)
                .style('border-width', '0px')
                .style('font-size', '0.8rem');

              d3.selectAll('.doc_selected')
                .classed('doc_selected', false)
                .style('background-color', 'white');

              // Adjust the effect to the selected tweet
              d3.select(e.target)
                .classed('doc_glyph_selected', true)
                .style('border-width', '2px')
                .style('opacity', 1);

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_selected', false)
                .style('background-color', 'white');

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_selected', true)
                .style('background-color', 'whitesmoke');
            }

            dispatch({
              type: 'SELECT_TWEET',
              payload: tweet
            });
          }}
        />
        <div>{tweet.screenName}</div>
        <ScoreView tweet={tweet} />
      </div>
      <ContentDiv>{tweet.content}</ContentDiv>
    </DocumentWrapper>
  );
};

export default Document;

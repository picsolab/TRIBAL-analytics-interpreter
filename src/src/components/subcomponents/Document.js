import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import d3tooltip from 'd3-tooltip';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import { grommet } from 'grommet/themes';
import { globalColors } from '../../GlobalStyles';

const tooltip = d3tooltip(d3);

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
      : `background-color: ` + globalColors.group.con};

  opacity: 0.5;
  cursor: pointer;
`;

const ScoreDiv = styled.div.attrs({
  className: 'score'
})``;

const ContentDiv = styled.div.attrs({
  className: 'content'
})`
  width: 90%;
  padding: 3px;
  font-size: 0.8rem;
`;

const IndexIndicator = styled.div.attrs({
  className: 'index_indicator'
})`
  height: 20px;
  width: 40px;
  text-align: center;
  background: mediumaquamarine;
  color: white;
  margin-top: auto;
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

const ScoreView = ({ tweet, features }) => {
  const ref = useRef(null);
  const featureNames = features.map(d => d.key),
    numFeatures = featureNames.length,
    tweetScores = Object.values(_.pick(tweet, featureNames));

  const layout = {
    width: 50,
    height: 35,
    marginBottom: 10,
    svg: {
      width: 50,
      height: 35
    }
  };

  var xFeatureScale = d3.scaleBand().range([0, layout.svg.width]);

  var yScoreScale = d3
    .scaleLinear()
    .domain([1, 0])
    .range([layout.svg.height - layout.marginBottom, 0]);

  const yCareScale = d3
    .scaleOrdinal()
    .domain([1, 0, 3, 2])
    .range([
      layout.svg.height - layout.marginBottom,
      layout.svg.height -
        layout.marginBottom -
        (layout.svg.height - 3 * layout.marginBottom) / 1,
      layout.svg.height -
        layout.marginBottom -
        (layout.svg.height - 3 * layout.marginBottom) / 2,
      layout.marginBottom
    ]);

  const yFairnessScale = d3
    .scaleOrdinal()
    .domain([1, 0, 2])
    .range([
      layout.svg.height - layout.marginBottom,
      layout.svg.height -
        layout.marginBottom -
        (layout.svg.height - 2 * layout.marginBottom) / 2,
      layout.marginBottom
    ]);

  const numToCat4Scale = d3
    .scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range(['Vice', 'Both', 'None', 'Virtue']);
  const numToCat3Scale = d3
    .scaleOrdinal()
    .domain([0, 1, 2])
    .range(['Vice', 'None', 'Virtue']);

  useEffect(() => {
    const svg = d3.select(ref.current);
    const featureRecData = svg
      // .append('g')
      // .attr('class', 'g_score')
      .selectAll('.feature_rect')
      .data(tweetScores);

    xFeatureScale.domain(d3.range(numFeatures));

    // Modify this one, and the next one for updating
    featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.svg.width / numFeatures - 3)
      .attr('height', (d, i) => layout.svg.height - layout.marginBottom - features[i].scoreScale(d))
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => features[i].scoreScale(d))
      .style('fill', globalColors.feature)
      .on('mouseover', (d, i) => {
        const titleHtml = '<div style="font-weight: 600">Features</div>';
        const scoreHtml = features.map(feature => {
          return (
            '<div>- ' +
            feature.key +
            ': ' +
            (feature.type === 'categorical'
              ? (feature.key === 'fairness') || (feature.key === 'purity')
                ? numToCat3Scale(tweet[feature.key])
                : numToCat4Scale(tweet[feature.key])
              : tweet[feature.key])
            + '</div>'
          );
        });

        tooltip.html(titleHtml + scoreHtml.join(''));
        tooltip.show();
        console.log(scoreHtml);
      })
      .on('mouseout', (d, i) => {
        tooltip.hide();
      });
    featureRecData.exit().remove();
      
    featureRecData
      .attr('width', layout.svg.width / numFeatures - 3)
      .attr('height', (d, i) => layout.svg.height - layout.marginBottom - features[i].scoreScale(d))
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => features[i].scoreScale(d))
      .on('mouseover', (d, i) => {
        const titleHtml = '<div style="font-weight: 600">Features</div>';
        const scoreHtml = features.map(feature => {
          return (
            '<div>- ' +
            feature.key +
            ': ' +
            (feature.type === 'categorical'
              ? (feature.key === 'fairness') || (feature.key === 'purity')
                ? numToCat3Scale(tweet[feature.key])
                : numToCat4Scale(tweet[feature.key])
              : tweet[feature.key])
            + '</div>'
          );
        });

        tooltip.html(titleHtml + scoreHtml.join(''));
        tooltip.show();
        console.log(scoreHtml);
        console.log(d3.selectAll('.feature_rect'))
      })
      .on('mouseout', (d, i) => {
        tooltip.hide();
      });
    

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(features.map(d => d.abbr))
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => layout.svg.height)
      .style('font-size', '0.6rem');
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
  const { 
    tweet, 
    isSelected,
    features 
  } = props;
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
              classList.filter(d => d === 'doc_glyph_secon  xd_selected')
                .length !== 0;

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
          onContextMenu={e => {
            e.preventDefault();

            const classList = e.target.className.split(' ');
            const isSelected =
              classList.filter(d => d === 'second_selected').length !== 0;

            if (isSelected) {
            } else {
              // to encode the selection

              // Cancel all effects
              d3.selectAll('.doc_glyph')
                .classed('.doc_glyph_second_selected', false)
                .style('opacity', 0.5)
                .style('border-width', '0px')
                .style('font-size', '0.8rem');

              d3.selectAll('.doc_second_selected')
                .classed('doc_second_selected', false)
                .style('background-color', 'white');

              // Adjust the effect to the selected tweet
              d3.select(e.target)
                .classed('doc_glyph_second_selected', true)
                .style('border-width', '2px')
                .style('opacity', 1);

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_second_selected', false)
                .style('background-color', 'white');

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_second_selected', true)
                .style('background-color', 'whitesmoke');
            }

            dispatch({
              type: 'SELECT_SECOND_TWEET',
              payload: tweet.tweetIdx
            });
          }}
        />
        <div>{tweet.screenName}</div>
        <ScoreView 
          tweet={tweet}
          features={features} 
        />
      </div>
      <div style={{ display: 'flex' }}>
        <ContentDiv>{tweet.rawContent}</ContentDiv>
        <IndexIndicator>{tweet.tweetIdx}</IndexIndicator>
      </div>
    </DocumentWrapper>
  );
};

export default Document;

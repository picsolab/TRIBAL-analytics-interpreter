import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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

import Document from '../subcomponents/Document';

const DocumentViewWrapper = styled(SectionWrapper).attrs({
  className: 'document_view_wrapper'
})`
  grid-area: d;
`;

const DocumentListWrapper = styled(ListViewStyle).attrs({
  className: 'doc_list'
})`
  overflow-y: scroll;
`;

const ScoreView = ({ tweetList }) => {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const layout = {
    width: 40,
    height: 35,
    marginBottom: 10,
    svg: {
      width: 40,
      height: 35
    }
  };

  useEffect(() => {
    const features = ['valence', 'dominance', 'harm', 'fairness'],
      numFeatures = features.length;

    const avgScores = features.map(feature => {
      return _.mean(tweetList.map(d => d[feature]));
    });

    // const avgScores = {
    //   valence: 0.5,
    //   arousal: 0.5,
    //   fairness: 0.3,
    //   harm: 0.8
    // };
    console.log('avgScores: ', avgScores);

    const xFeatureScale = d3
      .scaleBand()
      .domain(d3.range(numFeatures))
      .range([0, layout.svg.width]);

    const yScoreScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([layout.svg.height - layout.marginBottom, 0]);

    const yHarmScale = d3
      .scaleLinear()
      .domain([0, 3])
      .range([layout.svg.width, 0]);

    const featureRect = d3
      .select(ref.current)
      .selectAll('.feature_avg_rect')
      .data(avgScores)
      .enter()
      .append('rect')
      .attr('class', 'feature_avg_rect')
      .attr('width', layout.svg.width / numFeatures - 3)
      .attr('height', (d, i) => (i === 2 ? yHarmScale(d) : yScoreScale(d)))
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => {
        console.log('in y: ', d, i, yHarmScale(d), yScoreScale(d));
        return i === 2
          ? layout.svg.height - layout.marginBottom - yHarmScale(d)
          : layout.svg.height - layout.marginBottom - yScoreScale(d);
      })
      .style('fill', globalColors.feature)
      .style('cursor', 'pointer')
      .on('click', function(d, i) {
        const sortBy =
          i === 0
            ? 'valence'
            : i === 1
            ? 'dominance'
            : i === 2
            ? 'harm'
            : 'fairness';

        d3.selectAll('.feature_sort_by').classed('feature_sort_by', false);
        d3.select(this).classed('feature_sort_by', true);
        dispatch({
          type: 'SORT_TWEETS_BY_FEATURE',
          payload: sortBy
        });
      });

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(['V', 'D', 'H', 'F'])
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => layout.svg.height)
      .style('font-size', '0.6rem');
  }, [tweetList, ref.current]);

  return (
    <div>
      <div
        style={{
          width: layout.width,
          height: layout.height,
          marginLeft: 'auto'
        }}
      >
        <svg width="100%" height="100%" ref={ref} />
      </div>
    </div>
  );
};

const DocumentView = ({ tweetList, filteredTweetList, selectedTweet }) => {
  if (!tweetList || tweetList.length === 0) return <div />;

  return (
    <DocumentViewWrapper>
      <SubsectionTitle>Document</SubsectionTitle>
      <ScoreView tweetList={tweetList} />
      <div style={{ fontWeight: 600, fontSize: '0.7rem' }}>Selected</div>
      <Document tweet={selectedTweet} isSelected={true} />
      {/* <div style={{ borderBottom: '1px solid gray', height: '1px' }}>
        &nbsp;
      </div> */}
      <DocumentListWrapper>
        <InfiniteScroll items={tweetList} step={10}>
          {item => (
            <Document
              tweet={item}
              isSelected={item.tweetId === selectedTweet.tweetId ? true : false}
            />
          )}
        </InfiniteScroll>
      </DocumentListWrapper>
    </DocumentViewWrapper>
  );
};

export default DocumentView;

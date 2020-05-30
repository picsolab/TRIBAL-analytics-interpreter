import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import { Button, InfiniteScroll } from 'grommet';
import {
  globalColors,
  lDocView,
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
  background-color: white;
  margin: 5px;
`;

const DocumentListWrapper = styled(ListViewStyle).attrs({
  className: 'doc_list'
})`
  overflow-y: scroll;
`;

const ScoreView = ({ // ScoreView as a whole on top of the list
  tweetList,
  features 
}) => {
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
    const featureNames = features.map(d => d.key),
      numFeatures = featureNames.length;

    const avgScores = featureNames.map(feature => {
      return _.mean(tweetList.map(d => d[feature]));
    });

    const xFeatureScale = d3
      .scaleBand()
      .domain(d3.range(numFeatures))
      .range([0, layout.svg.width]);

    const yScoreScale = d3
      .scaleLinear()
      .domain([1, 0])
      .range([layout.svg.height - layout.marginBottom, 0]);

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(['V', 'F', 'D', 'C'])
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => layout.svg.height)
      .style('font-size', '0.6rem')
      .on('click', function(d, i) {
        const sortBy =
          i === 0
            ? 'valence'
            : i === 1
            ? 'fairness'
            : i === 2
            ? 'dominance'
            : 'care';

        d3.selectAll('.feature_sort_by').classed('feature_sort_by', false);
        d3.select(this).classed('feature_sort_by', true);
        dispatch({
          type: 'SORT_TWEETS_BY_FEATURE',
          payload: sortBy
        });
      });
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

const DocumentView = ({ 
  tweetList, 
  filteredTweetList, 
  selectedTweet,
  features
}) => {
  if (!tweetList || tweetList.length === 0) return <div />;

  // Set the feature scales for scoreView
  features.forEach(feature => {
    const featureScale = feature.scoreScale;

    if (feature.type == 'continuous') {
      featureScale
        .domain(feature.domain)
        .range([25, 0]);
      
    } else if (feature.type == 'categorical') {
      // const height = lCom.hPlot.featurePlot.h,
      //   topMargin = layout.margin.top,
      //   numCategory = feature.values.length;
      // rangeList = d3.range(numCategory).map(
      //   idx => height - (height / (numCategory - 1)) * idx // e.g., 100 - (100/3) * 1 - when there are 4 categories
      // );
      featureScale
        .domain(feature.domain)
        .range([25, 0]);   
    }
  });

  return (
    <DocumentViewWrapper>
      <SubsectionTitle>Tweets</SubsectionTitle>
      <ScoreView 
        features={features}
        tweetList={tweetList} />
      <div style={{ fontWeight: 600, fontSize: '0.7rem' }}>Selected</div>
      <Document 
        tweet={selectedTweet} 
        isSelected={true}
        features={features} 
      />
      {/* <div style={{ borderBottom: '1px solid gray', height: '1px' }}>
        &nbsp;
      </div> */}
      <DocumentListWrapper>
        <InfiniteScroll items={tweetList} step={20}>
          {item => (
            <Document
              tweet={item}
              isSelected={item.tweetId === selectedTweet.tweetId ? true : false}
              features={features}
            />
          )}
        </InfiniteScroll>
      </DocumentListWrapper>
    </DocumentViewWrapper>
  );
};

export default DocumentView;

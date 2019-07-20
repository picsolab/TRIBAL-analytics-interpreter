import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import { Button } from 'grommet';
import {
  ComponentSubTitle,
  SubTitle,
  SubTitle2,
  ListViewStyle
} from '../../GlobalStyles';

import Document from '../subcomponents/Document';

const DocumentViewWrapper = styled(SubTitle2).attrs({
  className: 'document_view'
})`
  grid-area: d;
`;

const DocumentListWrapper = styled(ListViewStyle).attrs({
  className: 'document_list'
})`
  overflow-y: scroll;
`;

const ScoreView = props => {
  const ref = useRef(null);
  const layout = {
    width: 70,
    height: 35,
    marginBottom: 10,
    svg: {
      width: 70,
      height: 35
    }
  };
  const avgScores = {
    valence: 0.5,
    arousal: 0.5,
    dominance: 0.3,
    moral1: 0.8,
    moral2: 0.2,
    moral3: 0.1
  };

  const xFeatureScale = d3
    .scaleBand()
    .domain(d3.range(Object.values(avgScores).length))
    .range([0, layout.svg.width]);

  const yScoreScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([layout.svg.height - layout.marginBottom, 0]);

  useEffect(() => {
    // Use avgScores up there temporarily
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
      .data(Object.values(avgScores));

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.svg.width / 5 - 5)
      .attr('height', d => yScoreScale(d))
      .attr('x', (d, i) => xFeatureScale(i))
      .attr(
        'y',
        (d, i) => layout.svg.height - layout.marginBottom - yScoreScale(d)
      )
      .style('fill', 'mediumpurple');

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(['V', 'A', 'D', 'M', 'M', 'M'])
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => layout.svg.height)
      .style('font-size', '0.6rem');
  }, [props.tweets, ref.current]);

  return (
    <div
      style={{ width: layout.width, height: layout.height, marginLeft: 'auto' }}
    >
      <svg width="100%" height="100%" ref={ref} />
    </div>
  );
};

const DocumentView = ({ data }) => {
  const mockup = [0.7, 0.5, 0.3, 0.4];
  const top10Tweets = data.slice(0, 3);

  const [mode, setMode] = useState('whole');

  if (mode === 'whole')
    return (
      <DocumentViewWrapper>
        <ComponentSubTitle>Document</ComponentSubTitle>
        <DocumentListWrapper>
          <ScoreView tweets={data} />
          {data.map(tweet => (
            <Document tweet={tweet} />
          ))}
        </DocumentListWrapper>
      </DocumentViewWrapper>
    );
  else return <div />;
};

export default DocumentView;

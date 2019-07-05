import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useD3 } from 'd3blackbox';
import styled from 'styled-components';

import { loadData } from '../dataHandling';
import { SubTitle, SubTitle2 } from '../GlobalStyles';

const FeatureViewWrapper = styled.div.attrs({
  className: 'feature_view' // something here
})`
  grid-area: f;
`;

const ComponentSubTitle = styled(SubTitle2)`
  background-color: darkgray;
  color: white;
`;

// const data2 = require('../data/tweet_guncontrol.json');
// console.log(data2);

const FeatureView = props => {
  const ref = useRef(null);
  const layout = {
    width: 100,
    height: 100
  };

  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, layout.width]);

  useEffect(() => {
    const { data } = props;

    // Promise.all([
    //   d3.json('data/tweet_guncontrol.json', d => {
    //     console.log(d);
    //     return d;
    //   })
    // ]).then(([tweets]) => {
    //   console.log('inside');
    //   console.log(tweets);

    //   return tweets;
    // });

    const featureRecData = d3
      .select(ref.current)
      .selectAll('text')
      .data(data);

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', d => {
        console.log(d);
        const datum = d;
        return xScale(datum);
      })
      .attr('height', 10)
      .attr('x', 0)
      .attr('y', (d, i) => i * 15);

    const dataaa = 'dd';
  }, [props.data, ref.current]);

  return (
    <FeatureViewWrapper>
      <ComponentSubTitle>Feature</ComponentSubTitle>
      <svg width="100%" ref={ref}>
        <g />
        {/* <text x="10" y="45">
          {'R'}
        </text>
        <text x="10" y="70">
          {'A'}
        </text>
        <text x="10" y="95">
          {'D'}
        </text>
        <text x="10" y="120">
          {'M'}
        </text> */}
        <rect x="25" y="30" width="80" height="20" fill="mediumpurple" />
        <rect x="25" y="55" width="50" height="20" fill="mediumpurple" />
        <rect x="25" y="80" width="20" height="20" fill="mediumpurple" />
        <rect x="25" y="105" width="90" height="20" fill="mediumpurple" />
      </svg>
    </FeatureViewWrapper>
  );
};

export default FeatureView;

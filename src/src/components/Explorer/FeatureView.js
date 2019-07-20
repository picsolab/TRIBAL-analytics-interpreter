import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useD3 } from 'd3blackbox';
import styled from 'styled-components';

import { loadData } from '../../dataHandling';
import { ComponentSubTitle, SubTitle, SubTitle2 } from '../../GlobalStyles';

const FeatureViewWrapper = styled.div.attrs({
  className: 'feature_view' // something here
})`
  grid-area: f;
`;

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

    const featureRecData = d3
      .select(ref.current)
      .selectAll('text')
      .data(data);

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', d => {
        const datum = d;
        return xScale(datum);
      })
      .attr('height', 25)
      .attr('x', 25)
      .attr('y', (d, i) => 30 + i * 30)
      .style('fill', 'mediumpurple');

    const featureTitle = d3
      .select(ref.current)
      .selectAll('text')
      .data(['R', 'A', 'D', 'M'])
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', 10)
      .attr('y', (d, i) => i * 25 + 45);

    const dataaa = 'dd';
  }, [props.data, ref.current]);

  return (
    <FeatureViewWrapper>
      <ComponentSubTitle>Feature</ComponentSubTitle>
      <svg width="100%" ref={ref} />
    </FeatureViewWrapper>
  );
};

export default FeatureView;

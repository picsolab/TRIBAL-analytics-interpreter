import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import index from '../index.css';
import {
  globalColors,
  SectionTitle,
  SubTitle,
  SectionWrapper
} from '../GlobalStyles';

const layout = {
  margin: { top: 20, right: 110, bottom: 20, left: 30 },
  width: 400,
  height: 200,
  leftMargin: 30,
  innerHeight: 340 - 2,
  featureGroupPlot: {
    width: 400,
    height: 240,
    leftMargin: 10
  },
  wordGroupPlot: {
    width: 150,
    height: 150,
    leftMargin: 30
  }
};

const GroupViewerWrapper = styled(SectionWrapper)`
  grid-area: gr;
  background-color: whitesmoke;
`;

const FeatureGroupPlot = ({ tweets, selectedTweet, features }) => {
  const ref = useRef(null);

  const conTweets = tweets.filter(d => d.group === 'con'),
    libTweets = tweets.filter(d => d.group === 'lib');

  const featureAvgs = features.map(feature => {
    const avgCon = _.mean(conTweets.map(conTweet => conTweet[feature])),
      avgLib = _.mean(libTweets.map(libTweet => libTweet[feature]));

    return {
      key: feature.key,
      abbr: feature.abbr,
      avgCon: avgCon,
      avgLib: avgLib
    };
  });

  useEffect(() => {
    const svg = d3.select(ref.current);

    // d3.selectAll('text').remove();
    d3.select('.g_feature_group_plot').remove();

    const gFeatureLibPlot = svg
      .append('g')
      .attr('class', 'g_feature_group_plot')
      .attr('transform', 'translate(0,0)');

    const gFeatureConPlot = svg
      .append('g')
      .attr('class', 'g_feature_group_plot')
      .attr('transform', 'translate(' + layout.wordGroupPlot.width / 2 + ',0)');

    const yFeatureScale = d3
      .scaleBand()
      .domain(features.map((d, i) => d.key))
      .range([0, layout.wordGroupPlot.height]);

    const xAvgFeatureScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([
        layout.wordGroupPlot.leftMargin,
        layout.wordGroupPlot.width / 3 + 2
      ]);

    const colorConPDPScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(['whitesmoke', globalColors.group.con]);

    const colorLibPDPScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(['whitesmoke', globalColors.group.lib]);

    const yLiberalAxisSetting = d3.axisLeft(yFeatureScale).tickSize(0),
      yLiberalAxis = gFeatureConPlot
        .append('g')
        .call(yLiberalAxisSetting)
        .attr('class', 'g_liberal_y_axis')
        .attr(
          'transform',
          'translate(' + layout.wordGroupPlot.leftMargin + ',' + 0 + ')'
        );

    // const yConservativeAxisSetting = d3
    //     .axisRight(yFeatureScale)
    //     .tickValues([])
    //     .tickSize(0),
    //   yConservativeAxis = gFeatureGroupPlot
    //     .append('g')
    //     .call(yConservativeAxisSetting)
    //     .attr('class', 'g_conservative_y_axis')
    //     .attr(
    //       'transform',
    //       'translate(' +
    //         (layout.wordGroupPlot.width - layout.wordGroupPlot.leftMargin) +
    //         ',' +
    //         0 +
    //         ')'
    //     );

    const liberalRatioBars = gFeatureLibPlot
      .selectAll('.lib_feature_avg_bar')
      .data(featureAvgs)
      .enter()
      .append('rect')
      .attr('class', 'lib_feature_avg_bar')
      .attr('x', 0)
      .attr('y', (d, i) => yFeatureScale(d.key))
      .attr('width', d => xAvgFeatureScale(d.avgLib))
      .attr('height', yFeatureScale.bandwidth())
      .style('fill', d => globalColors.group.lib)
      .style('fill-opacity', 0.5);

    const conservativeRatioBars = gFeatureConPlot
      .selectAll('.con_feature_avg_bar')
      .data(featureAvgs)
      .enter()
      .append('rect')
      .attr('class', 'con_feature_avg_bar')
      .attr('x', d => layout.wordGroupPlot.width / 2)
      .attr('y', (d, i) => yFeatureScale(d.key))
      .attr('width', d => xAvgFeatureScale(d.avgCon))
      .attr('height', yFeatureScale.bandwidth())
      .style('fill', d => globalColors.group.con)
      .style('fill-opacity', 0.5);
  });

  return (
    <div>
      <svg
        // width={layout.width + layout.margin.left + layout.margin.right}
        // height={layout.height + layout.margin.top + layout.margin.bottom}
        width={layout.wordGroupPlot.width}
        height={layout.wordGroupPlot.height}
        viewBox={
          '0 0 ' +
          layout.wordGroupPlot.width +
          ' ' +
          layout.wordGroupPlot.height
        }
        preserveAspectRatio="xMinYMin"
        ref={ref}
      />
    </div>
  );
};

const GroupViewer = ({ tweets, selectedTweet, features }) => {
  return (
    <GroupViewerWrapper>
      <SectionTitle>Group</SectionTitle>
      <div>300 tweets selected</div>
      <FeatureGroupPlot tweets={tweets} features={features} />
    </GroupViewerWrapper>
  );
};

export default GroupViewer;

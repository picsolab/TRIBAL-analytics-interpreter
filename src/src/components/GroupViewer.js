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
  SubsectionTitle,
  SectionWrapper
} from '../GlobalStyles';

const layout = {
  margin: { top: 20, right: 20, bottom: 20, left: 30 },
  width: 300,
  height: 200,
  leftMargin: 30,
  innerHeight: 340 - 2,
  featureGroupPlot: {
    width: 300,
    height: 150,
    leftMargin: 30,
    groupPlot: {
      width: 100,
      height: 150,
      leftMargin: 30
    },
    diffPlot: {
      width: 100,
      height: 150,
      leftMargin: 30
    }
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
    const avgCon = _.mean(conTweets.map(conTweet => conTweet[feature.key])),
      avgLib = _.mean(libTweets.map(libTweet => libTweet[feature.key]));

    const diff = avgLib - avgCon;

    return {
      key: feature.key,
      abbr: feature.abbr,
      avgCon: avgCon,
      avgLib: avgLib,
      diffLib: diff > 0 ? diff : 0,
      diffCon: diff < 0 ? -diff : 0
    };
  });

  useEffect(() => {
    const svg = d3.select(ref.current);

    // d3.selectAll('text').remove();
    d3.select('.g_feature_lib_plot').remove();
    d3.select('.g_feature_con_plot').remove();
    d3.select('.g_feature_diff_plot').remove();

    console.log('featureAvgs: ', featureAvgs);

    const gFeatureGroupPlot = svg
      .append('g')
      .attr('class', 'g_feature_group_plot');

    const gFeatureLibPlot = gFeatureGroupPlot
      .append('g')
      .attr('class', 'g_feature_lib_plot')
      .attr('transform', 'translate(0,0)');

    const gFeatureDiffPlot = gFeatureGroupPlot
      .append('g')
      .attr('class', 'g_feature_diff_plot')
      .attr(
        'transform',
        'translate(' + layout.featureGroupPlot.groupPlot.width + ',0)'
      );

    const gFeatureConPlot = gFeatureGroupPlot
      .append('g')
      .attr('class', 'g_feature_con_plot')
      .attr(
        'transform',
        'translate(' +
          (layout.featureGroupPlot.groupPlot.width +
            layout.featureGroupPlot.diffPlot.width) +
          ',0)'
      );

    const yFeatureScale = d3
      .scaleBand()
      .domain(features.map((d, i) => d.abbr))
      .range([0, layout.featureGroupPlot.height]);

    const xAvgFeatureScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([
        layout.featureGroupPlot.groupPlot.leftMargin,
        layout.featureGroupPlot.groupPlot.width
      ]);

    const xDiffFeatureScale = d3
      .scaleLinear()
      .domain([0, 0.3])
      .range([
        0,
        layout.featureGroupPlot.diffPlot.width / 2 -
          layout.featureGroupPlot.diffPlot.leftMargin
      ]);

    const colorConPDPScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(['whitesmoke', globalColors.group.con]);

    const colorLibPDPScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(['whitesmoke', globalColors.group.lib]);

    const yFeatureAxisSetting = d3.axisLeft(yFeatureScale).tickSize(0),
      yLiberalAxis = gFeatureDiffPlot
        .append('g')
        .call(yFeatureAxisSetting)
        .attr('class', 'g_liberal_y_axis')
        .attr(
          'transform',
          'translate(' +
            layout.featureGroupPlot.diffPlot.width / 2 +
            ',' +
            0 +
            ')'
        );

    const libFeatureBars = gFeatureLibPlot
      .selectAll('.lib_feature_avg_bar')
      .data(featureAvgs)
      .enter()
      .append('rect')
      .attr('class', 'lib_feature_avg_bar')
      .attr(
        'x',
        d =>
          layout.featureGroupPlot.groupPlot.width - xAvgFeatureScale(d.avgLib)
      )
      .attr('y', (d, i) => yFeatureScale(d.abbr))
      .attr('width', d => xAvgFeatureScale(d.avgLib))
      .attr('height', yFeatureScale.bandwidth() - 3)
      .style('fill', d => globalColors.group.lib)
      .style('fill-opacity', 0.5);

    const libDiffBars = gFeatureDiffPlot
      .selectAll('.lib_feature_diff_bar')
      .data(featureAvgs)
      .enter()
      .append('rect')
      .attr('class', 'lib_feature_diff_bar')
      .attr(
        'x',
        d =>
          layout.featureGroupPlot.diffPlot.width / 2 -
          xDiffFeatureScale(d.diffLib)
      )
      .attr('y', (d, i) => yFeatureScale(d.abbr))
      .attr('width', d => xDiffFeatureScale(d.diffLib))
      .attr('height', yFeatureScale.bandwidth() - 3)
      .style('fill', d => globalColors.group.lib)
      .style('fill-opacity', 0.5);

    const conFeatureBars = gFeatureConPlot
      .selectAll('.con_feature_avg_bar')
      .data(featureAvgs)
      .enter()
      .append('rect')
      .attr('class', 'con_feature_avg_bar')
      .attr('x', d => 0)
      .attr('y', (d, i) => yFeatureScale(d.abbr))
      .attr('width', d => xAvgFeatureScale(d.avgCon))
      .attr('height', yFeatureScale.bandwidth() - 3)
      .style('fill', d => globalColors.group.con)
      .style('fill-opacity', 0.5);

    const conDiffBars = gFeatureDiffPlot
      .selectAll('.con_feature_diff_bar')
      .data(featureAvgs)
      .enter()
      .append('rect')
      .attr('class', 'con_feature_diff_bar')
      .attr('x', d => layout.featureGroupPlot.diffPlot.width / 2)
      .attr('y', (d, i) => yFeatureScale(d.abbr))
      .attr('width', d => xDiffFeatureScale(d.diffCon))
      .attr('height', yFeatureScale.bandwidth() - 3)
      .style('fill', d => globalColors.group.con)
      .style('fill-opacity', 0.5);
  });

  return (
    <div>
      <svg
        // width={layout.width + layout.margin.left + layout.margin.right}
        // height={layout.height + layout.margin.top + layout.margin.bottom}
        width="100%"
        height="100%"
        viewBox={
          '0 0 ' +
          layout.featureGroupPlot.width +
          ' ' +
          layout.featureGroupPlot.height
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
      <SubsectionTitle>Features</SubsectionTitle>
      <FeatureGroupPlot tweets={tweets} features={features} />
    </GroupViewerWrapper>
  );
};

export default GroupViewer;

import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
  globalColors,
  SectionWrapper,
  SectionTitle,
  SubTitle
} from '../../GlobalStyles';

import data from '../../data/planets.json';
import { renderQueue } from '../../lib/renderQueue';

const FeaturePlotViewWrapper = styled.div.attrs({
  className: 'feature_plot_view_wrapper'
})`
  grid-area: f;
  height: 100%;
`;

function d3_functor(v) {
  return typeof v === 'function'
    ? v
    : function() {
        return v;
      };
}

const layout = {
  margin: { top: 30, right: 110, bottom: 20, left: 30 },
  width: 800,
  height: 240,
  leftMargin: 50,
  innerHeight: 340 - 2,
  featurePlot: {
    width: 450
  },
  featureToOutputLines: {
    width: 40,
    height: 240
  },
  outputProbPlot: {
    width: 70,
    height: 240,
    leftMargin: 80,
    minRadius: 4,
    maxRadius: 10
  },
  clusterPlot: {
    width: 70,
    height: 240,
    leftMargin: 80,
    minRadius: 4,
    maxRadius: 15
  },
  pdpPlot: {
    width: 70,
    height: 240,
    leftMargin: 80
  }
};

const wholeWidth = layout.width + layout.margin.left + layout.margin.right,
  wholeHeight = layout.height + layout.margin.top + layout.margin.bottom;

const groupColorScale = d3
  .scaleOrdinal()
  .domain([1, 0])
  .range([globalColors.group.lib, globalColors.group.con]);

const groupWrongColorScale = d3
  .scaleOrdinal()
  .domain([1, 0])
  .range(['gray', globalColors.group.wrong.con]);

const groupRatioScale = d3
  .scaleLinear()
  .domain([0, 0.5, 1])
  .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib]);

const FeaturePlotView = React.memo(
  ({
    globalMode,
    tweets,
    clusters,
    words,
    selectedFeatures,
    isLoaded,
    pdpValues,
    pdpValuesForCon,
    pdpValuesForLib,
    pdpValuesForClusters,
    currentModel
  }) => {
    const dispatch = useDispatch();
    const ref = useRef(null),
      ref2 = useRef(null);

    const numFeatures = selectedFeatures.length;

    console.log('after mode update: ', tweets);

    // prettier-ignore
    const tweetsCorrectPred = tweets.filter(d => d.group === d.pred),
    tweetsWrongPred = tweets.filter(d => (d.group !== d.pred)),
    tweetsConWrongPred = tweets.filter(d => (d.group !== d.pred) && (d.group === '0')),
    tweetsLibWrongPred = tweets.filter(d => (d.group !== d.pred) && (d.group === '1'));

    useEffect(() => {
      const xFeatureScale = d3
        .scalePoint()
        .domain(selectedFeatures.map(({ key }) => key))
        .range([layout.margin.left, layout.featurePlot.width]);

      const yVDScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([layout.height, layout.margin.top]);

      const yHFScale = d3
        .scaleLinear()
        .domain([0, 3])
        .range([layout.height, layout.margin.top]);

      const yCareScale = d3
        .scaleOrdinal()
        .domain([2, 3, 0, 1])
        .range([
          layout.height,
          layout.height - ((layout.height - layout.margin.top) / 3) * 1,
          layout.height - ((layout.height - layout.margin.top) / 3) * 2,
          layout.margin.top
        ]);

      const yFairnessScale = d3
        .scaleOrdinal()
        .domain([2, 0, 1])
        .range([
          layout.height,
          layout.height - (layout.height - layout.margin.top) / 2,
          layout.margin.top
        ]);

      const xPDProbScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([0, layout.margin.left]);

      const yPDFeatureValueScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([layout.height, layout.margin.top]);

      const yPDCareFeatureValueScale = d3
        .scaleOrdinal()
        .domain([2, 3, 0, 1])
        .range([
          layout.height,
          layout.height - ((layout.height - layout.margin.top) / 3) * 1,
          layout.height - ((layout.height - layout.margin.top) / 3) * 2,
          layout.margin.top
        ]);

      const yPDFairnessFeatureValueScale = d3
        .scaleOrdinal()
        .domain([2, 0, 1])
        .range([
          layout.height,
          layout.height - (layout.height - layout.margin.top) / 2,
          layout.margin.top
        ]);

      const yAxis = d3.axisLeft();

      const container = d3.select(ref.current),
        svg = d3.select(ref2.current);

      // Clean up old elements before update
      d3.selectAll('.g_feature_plot').remove();
      d3.selectAll('.g_cluster_plot').remove();
      d3.selectAll('.g_output_prob_plot').remove();
      d3.selectAll('.g_feature_to_output_paths').remove();
      d3.selectAll('.g_pdp').remove();

      //* Render output prob plot
      const gOutputProbPlot = svg
        .append('g')
        .attr('class', 'g_output_prob_plot')
        .attr(
          'transform',
          'translate(' +
            (layout.featurePlot.width +
              layout.outputProbPlot.leftMargin +
              layout.outputProbPlot.maxRadius * 2) +
            ',0)'
        );

      // Calculate the histogram data
      const dataBinCorrectPredTweets = d3
          .histogram()
          .domain([0, 1])
          .value(d => d.prob)
          .thresholds(d3.range(0, 1, 0.05))(tweetsCorrectPred),
        dataBinConWrongPredTweets = d3
          .histogram()
          .domain([0, 1])
          .value(d => d.prob)
          .thresholds(d3.range(0, 1, 0.05))(tweetsConWrongPred),
        dataBinLibWrongPredTweets = d3
          .histogram()
          .domain([0, 1])
          .value(d => d.prob)
          .thresholds(d3.range(0, 1, 0.05))(tweetsLibWrongPred);

      const maxFreq = _.max(dataBinCorrectPredTweets.map(d => d.length)),
        maxFreqConWrong = _.max(dataBinConWrongPredTweets.map(d => d.length)),
        maxFreqLibWrong = _.max(dataBinLibWrongPredTweets.map(d => d.length));

      const xOutputProbCorrectHistScale = d3
        .scaleLinear()
        .domain([0, maxFreq])
        .range([0, layout.outputProbPlot.width / 2]);

      const xOutputProbWrongHistScale = d3
        .scaleLinear()
        .domain([0, _.max([maxFreqConWrong, maxFreqLibWrong])])
        .range([0, layout.outputProbPlot.width / 2]);

      const yOutputProbScale = d3
        .scaleLinear()
        .domain([1, 0])
        .range([layout.margin.top, layout.outputProbPlot.height]);

      const yGroupScale = d3
        .scaleOrdinal()
        .domain([1, 0])
        .range([layout.margin.top, layout.outputProbPlot.height]);

      const yOutputProbHistBinScale = d3
        .scaleBand()
        .domain(dataBinCorrectPredTweets.map(d => d.x0).reverse()) // From 1 to 0
        .range([layout.margin.top, layout.outputProbPlot.height]);

      const yOutputProbSetting = d3
        .axisLeft(globalMode === 0 ? yGroupScale : yOutputProbScale)
        .tickValues(globalMode === 0 ? [0, 1] : [0, 0.5, 1]);

      gOutputProbPlot
        .append('g')
        .call(yOutputProbSetting)
        .attr('class', globalMode === 0 ? 'g_group_axis' : 'g_output_prob_axis')
        .attr(
          'transform',
          'translate(' + layout.outputProbPlot.width / 2 + ',' + 0 + ')'
        );

      // Setting for title text and axis
      if (globalMode === 0) {
        gOutputProbPlot
          .append('text')
          .text('Group')
          .attr('x', 10)
          .attr('y', 10);
      } else {
        gOutputProbPlot
          .append('text')
          .text('Output')
          .attr('x', 10)
          .attr('y', 10);
        gOutputProbPlot
          .append('text')
          .text('Wrong')
          .attr('x', -5)
          .attr('y', 23)
          .style('font-size', '0.8rem');
        gOutputProbPlot
          .append('text')
          .text('Correct')
          .attr('x', 40)
          .attr('y', 23)
          .style('font-size', '0.8rem');
      }

      if (globalMode === 0) {
      } else {
        // tweetHistForCorrectPred
        gOutputProbPlot
          .append('g')
          .attr('class', 'g_output_prob_hist_for_correct_pred')
          .attr('transform', d => {
            return (
              'translate(' + layout.outputProbPlot.width / 2 + ',' + 0 + ')'
            );
          })
          .selectAll('.rect_output_prob_hist_for_correct_pred')
          .data(dataBinCorrectPredTweets)
          .enter()
          .append('rect')
          .attr('class', 'rect_output_prob_hist_for_correct_pred')
          .attr('x', 3)
          .attr('y', d => yOutputProbHistBinScale(d.x0))
          .attr('width', d => xOutputProbCorrectHistScale(d.length))
          .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
          .style('fill', d =>
            d.x0 >= 0.5 ? globalColors.group.lib : globalColors.group.con
          )
          .style('opacity', 0.5);

        // tweetLibHistForWrongPred
        gOutputProbPlot
          .append('g')
          .attr('class', 'g_output_prob_con_hist_for_lib_wrong_pred')
          .attr('transform', d => {
            return 'translate(' + 0 + ',' + 0 + ')';
          })
          .selectAll('.rect_output_prob_hist_for_lib_wrong_pred')
          .data(dataBinLibWrongPredTweets)
          .enter()
          .append('rect')
          .attr('class', 'rect_output_prob_hist_for_lib_wrong_pred')
          .attr(
            'x',
            d =>
              layout.outputProbPlot.width / 2 -
              3 -
              xOutputProbWrongHistScale(d.length)
          )
          .attr('y', d => yOutputProbHistBinScale(d.x0))
          .attr('width', d => xOutputProbWrongHistScale(d.length))
          .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
          .style('fill', d => globalColors.group.wrong.lib)
          .style('opacity', 0.5);

        // tweetLibHistForWrongPred
        gOutputProbPlot
          .append('g')
          .attr('class', 'g_output_prob_con_hist_for_con_wrong_pred')
          .attr('transform', d => {
            return 'translate(' + 0 + ',' + 0 + ')';
          })
          .selectAll('.rect_output_prob_hist_for_con_wrong_pred')
          .data(dataBinConWrongPredTweets)
          .enter()
          .append('rect')
          .attr('class', 'rect_output_prob_hist_for_con_wrong_pred')
          .attr(
            'x',
            d =>
              layout.outputProbPlot.width / 2 -
              3 -
              xOutputProbWrongHistScale(d.length)
          )
          .attr('y', d => yOutputProbHistBinScale(d.x0))
          .attr('width', d => xOutputProbWrongHistScale(d.length))
          .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
          .style('fill', d => globalColors.group.wrong.con)
          .style('opacity', 0.5);
      }

      //* Render featureToOutput lines
      const gFeatureToOutputLines = svg
        .append('g')
        .attr('class', 'g_feature_to_output_paths')
        .attr('transform', 'translate(' + layout.featurePlot.width + ',0)');

      const xFeatureToOutputScale = d3
        .scaleOrdinal()
        .domain([0, 1])
        .range([
          0,
          layout.featureToOutputLines.width +
            layout.outputProbPlot.leftMargin -
            20
        ]);

      const featureToOutputLinesData = gFeatureToOutputLines
        .selectAll('.line_feature_to_output')
        .data(tweets);

      featureToOutputLinesData
        .enter()
        .append('line')
        .attr(
          'class',
          d => 'line_feature_to_output line_feature_to_output_' + d.clusterId
        )
        .attr('x1', xFeatureToOutputScale(0))
        .attr('y1', d => {
          const lastFeature = selectedFeatures[selectedFeatures.length - 1].key;
          return lastFeature === 'care'
            ? yCareScale(d[lastFeature])
            : lastFeature === 'fairness'
            ? yFairnessScale(d[lastFeature])
            : yVDScale(d[lastFeature]);
        })
        .attr('x2', d => xFeatureToOutputScale(1))
        .attr('y2', d =>
          globalMode === 0 ? yGroupScale(d.group) : yOutputProbScale(d.prob)
        )
        .style('stroke', d =>
          d.group === d.pred
            ? groupColorScale(d.group)
            : groupWrongColorScale(d.group)
        )
        // .style('stroke-dasharray', d => (d.group === d.pred ? 'none' : '4,5'))
        .style('stroke-width', 0.3)
        .style('opacity', d => 0.3);

      featureToOutputLinesData
        .attr('x1', xFeatureToOutputScale(0))
        .attr('y1', d => {
          const lastFeature = selectedFeatures[selectedFeatures.length - 1].key;
          return lastFeature === 'care'
            ? yCareScale(d[lastFeature])
            : lastFeature === 'fairness'
            ? yFairnessScale(d[lastFeature])
            : yVDScale(d[lastFeature]);
        })
        .attr('x2', d => xFeatureToOutputScale(1))
        .attr('y2', d =>
          globalMode === 0 ? yGroupScale(d.group) : yOutputProbScale(d.prob)
        );

      featureToOutputLinesData.exit().remove();

      //* Render the feature plot
      const gFeaturePlot = svg.append('g').attr('class', 'g_feature_plot');

      const axesData = gFeaturePlot
        .selectAll('.axis')
        .data(selectedFeatures)
        .enter();

      const axes = axesData
        .append('g')
        .attr('class', function(d) {
          return 'axis g_feature_axis_' + d.key;
        })
        .attr('transform', function(d, i) {
          return 'translate(' + xFeatureScale(d.key) + ')';
        });

      const featureTitleData = gFeaturePlot
        .selectAll('text')
        .data(selectedFeatures)
        .enter();

      const featureTitles = featureTitleData
        .append('text')
        .text(d => d.abbr)
        .attr('x', (d, i) => xFeatureScale(d.key) - 10)
        .attr('y', (d, i) => 10)
        .style('font-size', '0.8rem');

      const render = renderQueue(draw).rate(30);

      const devicePixelRatio = window.devicePixelRatio || 1;
      const canvas = container
        .append('canvas')
        .attr('class', 'canvas_tweet_paths')
        // .attr('width', '100%')
        // .attr('height', '100%')
        // // .style('width', layout.width - 20 + 'px')
        // // .style('height', layout.height - 10 + 'px')
        // .attr('viewBox', '0 0 ' + wholeWidth + ' ' + wholeHeight)
        // .attr('preserveAspectRatio', 'xMinYMin')
        .attr('width', container.node().offsetWidth * 0.5)
        .attr('height', container.node().offsetHeight)
        .style('top', -(container.node().offsetHeight + 50) + 5 + 'px')
        .style('z-index', -1);

      const ctx = canvas.node().getContext('2d');
      // ctx.globalCompositeOperation = 'darken';
      // ctx.globalAlpha = 1;
      ctx.lineWidth = 0.7;

      // ctx.clearRect(0, 0, layout.width, layout.height);
      ctx.globalAlpha = d3.min([1.15 / Math.pow(tweets.length, 0.3), 1]);
      render(tweets);

      axes
        .append('g')
        .each(function(d, i) {
          var yAxisSetting;

          const drawPDPLine = d3
            .line()
            .x(e => xPDProbScale(e.pdpValue))
            .y(e =>
              d.key === 'care'
                ? yPDCareFeatureValueScale(e.featureValue)
                : d.key === 'fairness'
                ? yPDFairnessFeatureValueScale(e.featureValue)
                : yPDFeatureValueScale(e.featureValue)
            )
            .curve(d3.curveCatmullRom);

          const drawPDPArea = d3
            .area()
            .x0(0)
            .x1(e => xPDProbScale(e.pdpValue))
            .y(e =>
              d.key === 'care'
                ? yPDCareFeatureValueScale(e.featureValue)
                : d.key === 'fairness'
                ? yPDFairnessFeatureValueScale(e.featureValue)
                : yPDFeatureValueScale(e.featureValue)
            )
            .curve(d3.curveCatmullRom);

          // For harm and fairness, add ordinal scale + bar chart
          if (d.key === 'care') {
            yAxisSetting = d3
              .axisLeft(yCareScale)
              .tickValues([1, 0, 3, 2])
              .tickFormat(function(d, i) {
                return d === 0
                  ? 'None'
                  : d === 1
                  ? 'Virtue'
                  : d === 2
                  ? 'Vice'
                  : 'Both';
              })
              .tickSize(1);
            d3.select(this).call(yAxisSetting);

            // For all
            d3.select('.g_feature_axis_' + d.key)
              .selectAll('.rect_pdp')
              .data(pdpValues[d.key])
              .enter()
              .append('rect')
              .attr('class', 'rect_pdp')
              .attr('x', 2)
              .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
              .attr('width', e => xPDProbScale(e.pdpValue))
              .attr('height', 10)
              .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
              // .style('stroke-width', 4)
              .style('fill', 'rgb(190, 255, 231)')
              // .style('stroke-dasharray', '8,3')
              // .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.3);

            d3.select('.g_feature_axis_' + d.key)
              .selectAll('.rect_pdp_for_con')
              .data(pdpValuesForCon[d.key])
              .enter()
              .append('rect')
              .attr('class', 'rect_pdp_for_con')
              .attr('x', 2)
              .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
              .attr('width', e => xPDProbScale(e.pdpValue))
              .attr('height', 5)
              .style('stroke', d3.rgb(globalColors.group.con).darker())
              // .style('stroke-width', 4)
              .style('fill', globalColors.group.con)
              // .style('stroke-dasharray', '8,3')
              // .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.5);

            d3.select('.g_feature_axis_' + d.key)
              .selectAll('.rect_pdp_for_lib')
              .data(pdpValuesForLib[d.key])
              .enter()
              .append('rect')
              .attr('class', 'rect_pdp_for_lib')
              .attr('x', 2)
              .attr('y', e => yPDCareFeatureValueScale(e.featureValue))
              .attr('width', e => xPDProbScale(e.pdpValue))
              .attr('height', 5)
              .style('stroke', d3.rgb(globalColors.group.lib).darker())
              // .style('stroke-width', 4)
              .style('fill', globalColors.group.lib)
              // .style('stroke-dasharray', '8,3')
              // .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.5);
            // For valence and dominance, add linear scale + line chart
          } else if (d.key === 'fairness') {
            yAxisSetting = d3
              .axisLeft(yFairnessScale)
              .tickValues([1, 0, 2])
              .tickFormat(function(d, i) {
                return d === 0
                  ? 'None'
                  : d === 1
                  ? 'Virtue'
                  : d === 2
                  ? 'Vice'
                  : 'Both';
              })
              .tickSize(1);
            d3.select(this).call(yAxisSetting);

            // For all
            d3.select('.g_feature_axis_' + d.key)
              .selectAll('.rect_pdp')
              .data(pdpValues[d.key])
              .enter()
              .append('rect')
              .attr('class', 'rect_pdp')
              .attr('x', 2)
              .attr('y', e => yPDFairnessFeatureValueScale(e.featureValue) - 5)
              .attr('width', e => xPDProbScale(e.pdpValue))
              .attr('height', 10)
              .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
              // .style('stroke-width', 4)
              .style('fill', 'rgb(190, 255, 231)')
              // .style('stroke-dasharray', '8,3')
              // .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.3);

            d3.select('.g_feature_axis_' + d.key)
              .selectAll('.rect_pdp_for_con')
              .data(pdpValuesForCon[d.key])
              .enter()
              .append('rect')
              .attr('class', 'rect_pdp_for_con')
              .attr('x', 2)
              .attr('y', e => yPDFairnessFeatureValueScale(e.featureValue) - 5)
              .attr('width', e => xPDProbScale(e.pdpValue))
              .attr('height', 5)
              .style('stroke', d3.rgb(globalColors.group.con).darker())
              // .style('stroke-width', 4)
              .style('fill', globalColors.group.con)
              // .style('stroke-dasharray', '8,3')
              // .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.5);

            d3.select('.g_feature_axis_' + d.key)
              .selectAll('.rect_pdp_for_lib')
              .data(pdpValuesForLib[d.key])
              .enter()
              .append('rect')
              .attr('class', 'rect_pdp_for_lib')
              .attr('x', 2)
              .attr('y', e => yPDFairnessFeatureValueScale(e.featureValue))
              .attr('width', e => xPDProbScale(e.pdpValue))
              .attr('height', 5)
              .style('stroke', d3.rgb(globalColors.group.lib).darker())
              // .style('stroke-width', 4)
              .style('fill', globalColors.group.lib)
              // .style('stroke-dasharray', '8,3')
              // .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.5);
            // For valence and dominance, add linear scale + line chart
          } else {
            yAxisSetting = d3
              .axisLeft(yVDScale)
              .tickValues(d3.range(0, 1.1, 0.2))
              .tickSize(1);
            d3.select(this).call(yAxisSetting);

            //// Add a path (to draw a separate line), and also area (to fill the area)
            /// For all
            // path
            d3.select('.g_feature_axis_' + d.key)
              .append('path')
              .datum(pdpValues[d.key])
              .attr('class', 'path_pdp_' + d.key)
              .attr('d', drawPDPLine)
              .style('stroke', 'rgb(190, 255, 231)')
              .style('stroke-width', 4)
              .style('fill', 'none')
              // .style('stroke-dasharray', '8,3')
              .style('shape-rendering', 'crispedges')
              .style('opacity', 1);

            // area
            d3.select('.g_feature_axis_' + d.key)
              .append('path')
              .datum(pdpValues[d.key])
              .attr('class', 'area_pdp_' + d.key)
              .attr('d', drawPDPArea)
              .style('stroke', 'none')
              .style('fill', 'gray')
              .style('stroke-dasharray', '8,3')
              .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.3);

            /// Path
            // For con
            d3.select('.g_feature_axis_' + d.key)
              .append('path')
              .datum(pdpValuesForCon[d.key])
              .attr('class', 'path_pdp_for_con_' + d.key)
              .attr('d', drawPDPLine)
              .style('stroke', globalColors.group.con)
              .style('stroke-width', 2)
              .style('fill', 'none')
              // .style('stroke-dasharray', '8,3')
              .style('shape-rendering', 'crispedges')
              .style('opacity', 1);

            /// For lib
            d3.select('.g_feature_axis_' + d.key)
              .append('path')
              .datum(pdpValuesForLib[d.key])
              .attr('class', 'path_pdp_for_lib_' + d.key)
              .attr('d', drawPDPLine)
              .style('stroke', globalColors.group.lib)
              .style('stroke-width', 2)
              .style('fill', 'none')
              // .style('stroke-dasharray', '8,3')
              .style('shape-rendering', 'crispedges')
              .style('opacity', 1);

            /// Area
            // For con
            d3.select('.g_feature_axis_' + d.key)
              .append('path')
              .datum(pdpValuesForCon[d.key])
              .attr('class', 'area_pdp_for_con_' + d.key)
              .attr('d', drawPDPArea)
              .style('stroke', 'none')
              .style('fill', globalColors.group.con)
              .style('stroke-dasharray', '8,3')
              .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.3);

            // For lib
            d3.select('.g_feature_axis_' + d.key)
              .append('path')
              .datum(pdpValuesForLib[d.key])
              .attr('class', 'area_pdp_for_lib_' + d.key)
              .attr('d', drawPDPArea)
              .style('stroke', 'none')
              .style('fill', globalColors.group.lib)
              .style('stroke-dasharray', '8,3')
              .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.3);

            /// For circle
            // For con
            // For lib
          }
        })
        .append('text')
        .attr('class', 'title')
        .attr('text-anchor', 'start');

      // Add and store a brush for each axis.
      axes
        .append('g')
        .attr('class', 'brush')
        .each(function(d) {
          d3.select(this).call(
            (d.brush = d3
              .brushY()
              .extent([[-10, 0], [10, layout.height]])
              .on('start', brushstart)
              .on('brush', brush)
              .on('end', brush))
          );
        })
        .selectAll('rect')
        .attr('x', -8)
        .attr('width', 16);

      // For feature plots
      function project(d) {
        return selectedFeatures.map(function(p, i) {
          // check if data element has property and contains a value
          if (!(p.key in d) || d[p.key] === null) return null;

          return p.key === 'care'
            ? [xFeatureScale(p.key), yCareScale(d[p.key])]
            : p.key === 'fairness'
            ? [xFeatureScale(p.key), yFairnessScale(d[p.key])]
            : [xFeatureScale(p.key), yVDScale(d[p.key])];
        });
      }

      function draw(d) {
        ctx.strokeStyle = groupColorScale(d.group);
        ctx.beginPath();
        const coords = project(d);
        coords.forEach(function(p, i) {
          // this tricky bit avoids rendering null values as 0
          if (p === null) {
            // this bit renders horizontal lines on the previous/next
            // dimensions, so that sandwiched null values are visible
            if (i > 0) {
              const prev = coords[i - 1];
              if (prev !== null) {
                ctx.moveTo(prev[0], prev[1]);
                ctx.lineTo(prev[0] + 6, prev[1]);
              }
            }
            if (i < coords.length - 1) {
              const next = coords[i + 1];
              if (next !== null) {
                ctx.moveTo(next[0] - 6, next[1]);
              }
            }
            return;
          }

          if (i == 0) {
            ctx.moveTo(p[0], p[1]);
            return;
          }

          ctx.lineTo(p[0], p[1]);
        });
        ctx.stroke();
      }

      function brushstart() {
        d3.event.sourceEvent.stopPropagation();
      }

      // Handles a brush event, toggling the display of foreground lines.
      function brush() {
        render.invalidate();

        const actives = [];
        svg
          .selectAll('.axis .brush')
          .filter(function(d) {
            return d3.brushSelection(this);
          })
          .each(function(d) {
            actives.push({
              dimension: d,
              extent: d3.brushSelection(this)
            });
          });

        function within(value, extent, dim) {
          const selectedExtent =
            dim === 'valence' || dim === 'dominance'
              ? extent[0] <= yVDScale(value) && yVDScale(value) <= extent[1]
              : dim === 'fairness'
              ? extent[0] <= yFairnessScale(value) &&
                yFairnessScale(value) <= extent[1]
              : extent[0] <= yCareScale(value) &&
                yCareScale(value) <= extent[1];

          return selectedExtent;
        }

        const selected = tweets.filter(function(d) {
          if (
            actives.every(function(active) {
              const dim = active.dimension;

              return within(d[dim.key], active.extent, dim.key);
            })
          ) {
            return true;
          }
        });

        // show ticks for active brush dimensions
        // and filter ticks to only those within brush extents
        /*
      svg.selectAll('.axis')
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? true : false;
          })
          .classed('active', true)
          .each(function(dimension, i) {
            const extent = extents[i];
            d3.select(this)
              .selectAll('.tick text')
              .style('display', function(d) {
                const value = dimension.type.coerce(d);
                return dimension.type.within(value, extent, dimension) ? null : 'none';
              });
          });

      // reset dimensions without active brushes
      svg.selectAll('.axis')
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? false : true;
          })
          .classed('active', false)
          .selectAll('.tick text')
            .style('display', null);
      */

        ctx.clearRect(0, 0, layout.width, layout.height);
        ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1]);
        render(selected);
      } // end of brush()

      //* Render clusters
      const gClusterPlot = svg
        .append('g')
        .attr('class', 'g_cluster_plot')
        .attr(
          'transform',
          'translate(' +
            (layout.featurePlot.width +
              layout.outputProbPlot.leftMargin +
              layout.outputProbPlot.width +
              layout.clusterPlot.leftMargin +
              layout.clusterPlot.maxRadius * 2) +
            ',0)'
        );

      const yClusterCoordScale = d3
        .scaleBand()
        .domain(clusters.map(d => d.clusterId))
        .range([layout.margin.top, layout.clusterPlot.height]);

      const numTweetClusterScale = d3
        .scaleLinear()
        .domain(d3.extent(clusters.map(d => d.numTweets)))
        .range([layout.clusterPlot.minRadius, layout.clusterPlot.maxRadius]);

      const yClusterAxisSetting = d3
          .axisLeft(yClusterCoordScale)
          .tickValues([])
          .tickSize(0),
        yClusterAxis = gClusterPlot
          .append('g')
          .call(yClusterAxisSetting)
          .attr('class', 'g_cluster_y_axis')
          .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

      const drawTweetLine = d3
        .line()
        .x(d => {
          return xFeatureScale(d[0]);
        })
        .y((d, i) =>
          d[0] === 'care'
            ? yCareScale(d[1])
            : d[0] === 'fairness'
            ? yFairnessScale(d[1])
            : yVDScale(d[1])
        );

      // prettier-ignore
      const clusterCircles = gClusterPlot
        .selectAll('.cluster_circle')
        .data(clusters)
        .enter()
        .append('circle')
        .attr('class', (d, i) => 'cluster_circle cluster_circle_' + i)
        .attr('cx', 0)
        .attr('cy', d => yClusterCoordScale(d.clusterId) + yClusterCoordScale.bandwidth()/2)
        .attr('r', d => numTweetClusterScale(d.numTweets))
        .style('fill', d => groupRatioScale(d.groupRatio.lib))
        .style('fill-opacity', 0.5)
        .style('stroke', d => d3.rgb(groupRatioScale(d.groupRatio.lib)).darker())
        .on('mouseover', function(d) {
            d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).darker());
        })
        .on('mouseout', function(d) {
            d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).brighter());
        })
        .on('click', updateOnClickCluster);

      const clusterTitle = gClusterPlot
        .append('text')
        .text('Cluster')
        .attr('y', 10);

      if (globalMode !== 0) {
        //* Render Partial dependent plot (PDP)
        const gPDP = svg
          .append('g')
          .attr('class', 'g_pdp')
          .attr(
            'transform',
            'translate(' +
              (layout.featurePlot.width +
                layout.outputProbPlot.leftMargin +
                layout.outputProbPlot.width +
                layout.clusterPlot.width +
                layout.clusterPlot.maxRadius * 2 +
                layout.pdpPlot.leftMargin) +
              ',0)'
          );

        const yClusterCoordPDPScale = d3
          .scaleBand()
          .domain(clusters.map(d => d.clusterId))
          .range([layout.margin.top, layout.pdpPlot.height]);

        const xPDPScale = d3
          .scaleLinear()
          .domain([0, 1])
          .range([0, layout.pdpPlot.width]);

        const colorPDPScale = d3
          .scaleLinear()
          .domain([0, 0.5, 1]) // 0 (prob of being con) --- >>> --- 1 (prob of being lib)
          .range([
            globalColors.group.con,
            'whitesmoke',
            globalColors.group.lib
          ]);

        const yPDPAxisSetting = d3.axisLeft(yClusterCoordPDPScale).tickSize(0),
          yPDPAxis = gPDP
            .append('g')
            .call(yPDPAxisSetting)
            .attr('class', 'g_pdp_y_axis')
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

        const pdpBars = gPDP
          .selectAll('.cluster_circle')
          .data(
            clusters.map(d => {
              const clusterId = d.clusterId,
                tweetPDPValuesInCluster = tweets
                  .filter(e => e.clusterId === clusterId)
                  .map(f => f.prob);
              const avgPDPValuesForCluster = _.mean(tweetPDPValuesInCluster);

              return {
                clusterId: clusterId,
                avgPDPValue: avgPDPValuesForCluster
              };
            })
          )
          .enter()
          .append('rect')
          .attr(
            'class',
            (d, i) =>
              'cluster_output_prob_rect cluster_output_prob_rect_' + d.clusterId
          )
          .attr('x', 0)
          .attr('y', d => yClusterCoordPDPScale(d.clusterId))
          .attr('width', d => xPDPScale(d.avgPDPValue))
          .attr('height', yClusterCoordPDPScale.bandwidth() - 3)
          .style('fill', d => colorPDPScale(d.avgPDPValue))
          .style('opacity', 0.5);

        const pdpTitle = gPDP
          .append('text')
          .text('Output Prob')
          .attr('y', 10);
      }

      function updateOnClickCluster(d, i) {
        const selectedCluster = d3.select(this),
          clusterId = d.clusterId;
        console.log('clicked cluster: ', clusterId);
        if (selectedCluster.classed('cluster_selected') === true) {
          d3.select(this)
            .classed('cluster_selected', false)
            .style('stroke', 'gray')
            .style('stroke-width', '1px');
          console.log('click already selected cluster: ', clusterId);

          // Return back all elements to the normal
          gFeaturePlot.selectAll('.path_tweet').remove();
          d3.select('canvas').style('opacity', 1);

          d3.selectAll('.cluster_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_selected', false);

          d3.selectAll('.cluster_output_prob_rect_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_output_prob_rect_selected', false);

          d3.selectAll('.line_feature_to_output').style('opacity', 0.3);

          d3.selectAll('.path_tweet_for_cluster').remove();
          //d3.selectAll('.g_output_prob_hist_for_correct_pred').remove();
          //d3.selectAll('.g_output_prob_hist_for_wrong_pred').remove();
          //d3.selectAll('.g_output_prob_hist_for_correct_pred_for_cluster').remove();
          //d3.selectAll('.g_output_prob_con_hist_for_lib_wrong_pred_for_cluster').remove();
          //d3.selectAll('.g_output_prob_lib_hist_for_lib_wrong_pred_for_cluster').remove();

          d3.selectAll('.path_pdp').remove();
          d3.selectAll('.area_pdp').remove();
          d3.selectAll('.rect_pdp').remove();
          d3.selectAll('.path_pdp_for_con').remove();
          d3.selectAll('.area_pdp_for_con').remove();
          d3.selectAll('.path_pdp_for_lib').remove();
          d3.selectAll('.area_pdp_for_lib').remove();
          d3.selectAll('.rect_pdp_for_con').remove();
          d3.selectAll('.rect_pdp_for_lib').remove();

          // To put back the output prob plot
          const tweetsCorrectPredForCluster = tweetsCorrectPred.filter(
            e => e.clusterId === clusterId
          );

          const dataBinCorrectPredTweets = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsCorrectPred);

          const dataBinWrongPredTweets = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

          const outputProbCorrRectsData = d3
            .selectAll('.rect_output_prob_hist_for_correct_pred')
            .data(dataBinCorrectPredTweets);

          outputProbCorrRectsData.exit().remove();

          outputProbCorrRectsData
            .attr('y', d => yOutputProbHistBinScale(d.x0))
            .attr('width', d => xOutputProbCorrectHistScale(d.length));

          // gOutputProbPlot
          //   .append('g')
          //   .attr('class', 'g_output_prob_hist_for_correct_pred')
          //   .attr('transform', d => {
          //     return (
          //       'translate(' + layout.outputProbPlot.width / 2 + ',' + 0 + ')'
          //     );
          //   })
          //   .selectAll('.rect_output_prob_hist_for_correct_pred')
          //   .data(dataBinCorrectPredTweetsForCluster)
          //   .enter()
          //   .append('rect')
          //   .attr('class', 'rect_output_prob_hist_for_correct_pred')
          //   .attr('x', 3)
          //   .attr('y', d => yOutputProbHistBinScale(d.x0))
          //   .attr('width', d => xOutputProbCorrectHistScale(d.length))
          //   .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
          //   .style('fill', d =>
          //     d.x0 >= 0.5 ? globalColors.group.lib : globalColors.group.con
          //   )
          //   .style('opacity', 0.3);

          const outputProbWrongRectsForLibData = d3
            .selectAll('.rect_output_prob_hist_for_lib_wrong_pred')
            .data(dataBinLibWrongPredTweets);

          outputProbWrongRectsForLibData.exit().remove();

          outputProbWrongRectsForLibData
            .attr(
              'x',
              d =>
                layout.outputProbPlot.width / 2 -
                3 -
                xOutputProbWrongHistScale(d.length)
            )
            .attr('width', d => xOutputProbWrongHistScale(d.length));

          const outputProbWrongRectsForConData = d3
            .selectAll('.rect_output_prob_hist_for_con_wrong_pred')
            .data(dataBinConWrongPredTweets);

          outputProbWrongRectsForConData.exit().remove();

          outputProbWrongRectsForConData
            .attr(
              'x',
              d =>
                layout.outputProbPlot.width / 2 -
                3 -
                xOutputProbWrongHistScale(d.length)
            )
            .attr('width', d => xOutputProbWrongHistScale(d.length));

          // const tweetLibHistForWrongPred = gOutputProbPlot
          //   .append('g')
          //   .attr('class', 'g_output_prob_con_hist_for_lib_wrong_pred')
          //   .attr('transform', d => {
          //     return 'translate(' + 0 + ',' + 0 + ')';
          //   })
          //   .selectAll('.rect_output_prob_hist_for_lib_wrong_pred')
          //   .data(dataBinLibWrongPredTweets)
          //   .enter()
          //   .append('rect')
          //   .attr('class', 'rect_output_prob_hist_for_lib_wrong_pred')
          // .attr(
          //   'x',
          //   d =>
          //     layout.outputProbPlot.width / 2 -
          //     3 -
          //     xOutputProbWrongHistScale(d.length)
          // )
          //   .attr('y', d => yOutputProbHistBinScale(d.x0))
          //   .attr('width', d => xOutputProbWrongHistScale(d.length))
          //   .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
          //   .style('fill', d => globalColors.group.wrong.lib)
          //   .style('opacity', 0.5);

          // const tweetConHistForWrongPred = gOutputProbPlot
          //   .append('g')
          //   .attr('class', 'g_output_prob_con_hist_for_con_wrong_pred')
          //   .attr('transform', d => {
          //     return 'translate(' + 0 + ',' + 0 + ')';
          //   })
          //   .selectAll('.rect_output_prob_hist_for_con_wrong_pred')
          //   .data(dataBinConWrongPredTweets)
          //   .enter()
          //   .append('rect')
          //   .attr('class', 'rect_output_prob_hist_for_con_wrong_pred')
          //   .attr(
          //     'x',
          //     d =>
          //       layout.outputProbPlot.width / 2 -
          //       3 -
          //       xOutputProbWrongHistScale(d.length)
          //   )
          //   .attr('y', d => yOutputProbHistBinScale(d.x0))
          //   .attr('width', d => xOutputProbWrongHistScale(d.length))
          //   .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
          //   .style('fill', d => globalColors.group.wrong.con)
          //   .style('opacity', 0.5);

          // To restore PDP for all
          // For cluster-specific PDPs
          d3.selectAll('.axis').each(function(d, i) {
            var yAxisSetting;

            const drawPDPLine = d3
              .line()
              .x(e => xPDProbScale(e.pdpValue))
              .y(e =>
                d.key === 'care'
                  ? yPDCareFeatureValueScale(e.featureValue)
                  : d.key === 'fairness'
                  ? yPDFairnessFeatureValueScale(e.featureValue)
                  : yPDFeatureValueScale(e.featureValue)
              )
              .curve(d3.curveCatmullRom);

            const drawPDPArea = d3
              .area()
              .x0(0)
              .x1(e => xPDProbScale(e.pdpValue))
              .y(e =>
                d.key === 'care'
                  ? yPDCareFeatureValueScale(e.featureValue)
                  : d.key === 'fairness'
                  ? yPDFairnessFeatureValueScale(e.featureValue)
                  : yPDFeatureValueScale(e.featureValue)
              )
              .curve(d3.curveCatmullRom);

            // For harm and fairness, add ordinal scale + bar chart
            if (d.key === 'care') {
              yAxisSetting = d3
                .axisLeft(yCareScale)
                .tickValues([1, 0, 3, 2])
                .tickFormat(function(d, i) {
                  return d === 0
                    ? 'None'
                    : d === 1
                    ? 'Virtue'
                    : d === 2
                    ? 'Vice'
                    : 'Both';
                })
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              // For all
              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp')
                .data(pdpValues[d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp')
                .attr('x', 2)
                .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 10)
                .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
                // .style('stroke-width', 4)
                .style('fill', 'rgb(190, 255, 231)')
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_con')
                .data(pdpValuesForCon[d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_con')
                .attr('x', 2)
                .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.con).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.con)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_lib')
                .data(pdpValuesForLib[d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_lib')
                .attr('x', 2)
                .attr('y', e => yPDCareFeatureValueScale(e.featureValue))
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.lib).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.lib)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);
              // For valence and dominance, add linear scale + line chart
            } else if (d.key === 'fairness') {
              yAxisSetting = d3
                .axisLeft(yFairnessScale)
                .tickValues([1, 0, 2])
                .tickFormat(function(d, i) {
                  return d === 0
                    ? 'None'
                    : d === 1
                    ? 'Virtue'
                    : d === 2
                    ? 'Vice'
                    : 'Both';
                })
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              // For all
              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp')
                .data(pdpValues[d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp')
                .attr('x', 2)
                .attr(
                  'y',
                  e => yPDFairnessFeatureValueScale(e.featureValue) - 5
                )
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 10)
                .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
                // .style('stroke-width', 4)
                .style('fill', 'rgb(190, 255, 231)')
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_con')
                .data(pdpValuesForCon[d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_con')
                .attr('x', 2)
                .attr(
                  'y',
                  e => yPDFairnessFeatureValueScale(e.featureValue) - 5
                )
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.con).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.con)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_lib')
                .data(pdpValuesForLib[d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_lib')
                .attr('x', 2)
                .attr('y', e => yPDFairnessFeatureValueScale(e.featureValue))
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.lib).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.lib)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);
              // For valence and dominance, add linear scale + line chart
            } else {
              yAxisSetting = d3
                .axisLeft(yVDScale)
                .tickValues(d3.range(0, 1.1, 0.2))
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              //// Add a path (to draw a separate line), and also area (to fill the area)
              /// For all
              // path
              d3.select('.g_feature_axis_' + d.key)
                .append('path')
                .datum(pdpValues[d.key])
                .attr('class', 'path_pdp')
                .attr('d', drawPDPLine)
                .style('stroke', 'rgb(190, 255, 231)')
                .style('stroke-width', 4)
                .style('fill', 'none')
                // .style('stroke-dasharray', '8,3')
                .style('shape-rendering', 'crispedges')
                .style('opacity', 1);

              // area
              d3.select('.g_feature_axis_' + d.key)
                .append('path')
                .datum(pdpValues[d.key])
                .attr('class', 'area_pdp')
                .attr('d', drawPDPArea)
                .style('stroke', 'none')
                .style('fill', 'gray')
                .style('stroke-dasharray', '8,3')
                .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);

              /// Path
              // For con
              d3.select('.g_feature_axis_' + d.key)
                .append('path')
                .datum(pdpValuesForCon[d.key])
                .attr('class', 'path_pdp_for_con')
                .attr('d', drawPDPLine)
                .style('stroke', globalColors.group.con)
                .style('stroke-width', 2)
                .style('fill', 'none')
                // .style('stroke-dasharray', '8,3')
                .style('shape-rendering', 'crispedges')
                .style('opacity', 1);

              /// For lib
              d3.select('.g_feature_axis_' + d.key)
                .append('path')
                .datum(pdpValuesForLib[d.key])
                .attr('class', 'path_pdp_for_lib')
                .attr('d', drawPDPLine)
                .style('stroke', globalColors.group.lib)
                .style('stroke-width', 2)
                .style('fill', 'none')
                // .style('stroke-dasharray', '8,3')
                .style('shape-rendering', 'crispedges')
                .style('opacity', 1);

              /// Area
              // For con
              d3.select('.g_feature_axis_' + d.key)
                .append('path')
                .datum(pdpValuesForCon[d.key])
                .attr('class', 'area_pdp_for_con')
                .attr('d', drawPDPArea)
                .style('stroke', 'none')
                .style('fill', globalColors.group.con)
                .style('stroke-dasharray', '8,3')
                .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);

              // For lib
              d3.select('.g_feature_axis_' + d.key)
                .append('path')
                .datum(pdpValuesForLib[d.key])
                .attr('class', 'area_pdp_for_lib')
                .attr('d', drawPDPArea)
                .style('stroke', 'none')
                .style('fill', globalColors.group.lib)
                .style('stroke-dasharray', '8,3')
                .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);
            }
          });

          // Put back the tweetList with entire tweets
          dispatch({
            type: 'LIST_TWEETS_IN_CL',
            payload: tweets
          });

          dispatch({
            type: 'SHOW_SEQ_PLOT_FOR_CLUSTER',
            payload: {
              isClusterSelected: false,
              tweetsInClusterForSeqPlot: []
            }
          });

          dispatch({
            type: 'CAL_PD',
            payload: tweets
          });
          // When unselecting a selected cluster (going back to the whole)
        } else {
          const clusterId = d.clusterId,
            tweetsInCluster = tweets.filter(e => e.clusterId === clusterId);

          // List tweets within this cluster in tweetList
          dispatch({
            type: 'LIST_TWEETS_IN_CL',
            payload: tweetsInCluster
          });

          dispatch({
            type: 'SHOW_SEQ_PLOT_FOR_CLUSTER',
            payload: {
              isClusterSelected: true,
              tweetsInClusterForSeqPlot: tweetsInCluster
            }
          });

          // Remove previous elements
          gFeaturePlot.selectAll('.path_tweet_for_cluster').remove();

          d3.selectAll('.path_pdp').remove();
          d3.selectAll('.area_pdp').remove();
          d3.selectAll('.rect_pdp').remove();
          d3.selectAll('.path_pdp_for_con').remove();
          d3.selectAll('.area_pdp_for_con').remove();
          d3.selectAll('.path_pdp_for_lib').remove();
          d3.selectAll('.area_pdp_for_lib').remove();
          d3.selectAll('.rect_pdp_for_con').remove();
          d3.selectAll('.rect_pdp_for_lib').remove();

          d3.selectAll('.cluster_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_selected', false);

          d3.selectAll('.cluster_output_prob_rect_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_output_prob_rect_selected', false);

          d3.selectAll('.line_feature_to_output').style('opacity', 0);

          // Highlight selected cluster
          selectedCluster.classed('cluster_selected', true);
          selectedCluster.style('stroke-width', '3px').style('stroke', 'black');

          d3.select('.cluster_output_prob_rect_' + clusterId)
            .style('stroke', 'black')
            .style('stroke-width', '2px')
            .classed('cluster_output_prob_rect_selected', true);

          d3.selectAll('.line_feature_to_output_' + clusterId).style(
            'opacity',
            0.3
          );

          // To highlight the paths
          // Highlight the cluster paths by generating svg paths
          const tweetsPathDataForCluster = tweetsInCluster.map(d => {
            const tweetWithSelectedFeatures = _.pick(
              d,
              selectedFeatures.map(({ key }) => key)
            );
            var tweetPathData = Object.entries(tweetWithSelectedFeatures);
            tweetPathData.group = d.group;

            return tweetPathData;
          });

          gFeaturePlot
            .selectAll('.path_tweet_for_cluster')
            .data(tweetsPathDataForCluster)
            .enter()
            .append('path')
            .attr('class', 'path_tweet_for_cluster')
            .attr('d', drawTweetLine)
            .style('stroke', d => groupColorScale(d.group))
            .style('fill', 'none')
            .style('stroke-width', 0.3)
            .style('opacity', 0.3);

          d3.select('canvas').style('opacity', 0.1);

          // To adjust the output prob plot
          const tweetsCorrectPredForCluster = tweetsCorrectPred.filter(
            e => e.clusterId === clusterId
          );
          const tweetsConWrongPredForCluster = tweetsWrongPred.filter(
            e => e.clusterId === clusterId && e.group === '0'
          );
          const tweetsLibWrongPredForCluster = tweetsWrongPred.filter(
            e => e.clusterId === clusterId && e.group === '1'
          );

          const dataBinCorrectPredTweetsForCluster = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsCorrectPredForCluster);

          const dataBinConWrongPredTweetsForCluster = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsConWrongPredForCluster);

          const dataBinLibWrongPredTweetsForCluster = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsLibWrongPredForCluster);

          // dataBinCorrectPredTweets = dataBinCorrectPredTweetsForCluster;

          const outputProbRectsData = d3
            .selectAll('.rect_output_prob_hist_for_correct_pred')
            .data(dataBinCorrectPredTweetsForCluster);

          outputProbRectsData.exit().remove();

          outputProbRectsData
            .attr('y', d => yOutputProbHistBinScale(d.x0))
            .attr('width', d => xOutputProbCorrectHistScale(d.length));

          const outputProbWrongRectsForLibData = d3
            .selectAll('.rect_output_prob_hist_for_lib_wrong_pred')
            .data(dataBinLibWrongPredTweetsForCluster);

          outputProbWrongRectsForLibData.exit().remove();
          outputProbWrongRectsForLibData
            .attr(
              'x',
              d =>
                layout.outputProbPlot.width / 2 -
                3 -
                xOutputProbWrongHistScale(d.length)
            )
            .attr('width', d => xOutputProbWrongHistScale(d.length));

          const outputProbWrongRectsForConData = d3
            .selectAll('.rect_output_prob_hist_for_con_wrong_pred')
            .data(dataBinConWrongPredTweetsForCluster);

          outputProbWrongRectsForConData.exit().remove();
          outputProbWrongRectsForConData
            .attr(
              'x',
              d =>
                layout.outputProbPlot.width / 2 -
                3 -
                xOutputProbWrongHistScale(d.length)
            )
            .attr('width', d => xOutputProbWrongHistScale(d.length));

          // For cluster-specific PDPs
          d3.selectAll('.axis').each(function(d, i) {
            var yAxisSetting;

            const drawPDPLine = d3
              .line()
              .x(e => xPDProbScale(e.pdpValue))
              .y(e =>
                d.key === 'care'
                  ? yPDCareFeatureValueScale(e.featureValue)
                  : d.key === 'fairness'
                  ? yPDFairnessFeatureValueScale(e.featureValue)
                  : yPDFeatureValueScale(e.featureValue)
              )
              .curve(d3.curveCatmullRom);

            const drawPDPArea = d3
              .area()
              .x0(0)
              .x1(e => xPDProbScale(e.pdpValue))
              .y(e =>
                d.key === 'care'
                  ? yPDCareFeatureValueScale(e.featureValue)
                  : d.key === 'fairness'
                  ? yPDFairnessFeatureValueScale(e.featureValue)
                  : yPDFeatureValueScale(e.featureValue)
              )
              .curve(d3.curveCatmullRom);

            // For harm and fairness, add ordinal scale + bar chart
            if (d.key === 'care') {
              yAxisSetting = d3
                .axisLeft(yCareScale)
                .tickValues([1, 0, 3, 2])
                .tickFormat(function(d, i) {
                  return d === 0
                    ? 'None'
                    : d === 1
                    ? 'Virtue'
                    : d === 2
                    ? 'Vice'
                    : 'Both';
                })
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              // For all
              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp')
                .data(pdpValuesForClusters[clusterId]['all'][d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp')
                .attr('x', 2)
                .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 10)
                .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
                // .style('stroke-width', 4)
                .style('fill', 'rgb(190, 255, 231)')
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_con')
                .data(pdpValuesForClusters[clusterId]['con'][d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_con')
                .attr('x', 2)
                .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.con).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.con)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_lib')
                .data(pdpValuesForClusters[clusterId]['lib'][d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_lib')
                .attr('x', 2)
                .attr('y', e => yPDCareFeatureValueScale(e.featureValue))
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.lib).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.lib)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);
              // For valence and dominance, add linear scale + line chart
            } else if (d.key === 'fairness') {
              yAxisSetting = d3
                .axisLeft(yFairnessScale)
                .tickValues([1, 0, 2])
                .tickFormat(function(d, i) {
                  return d === 0
                    ? 'None'
                    : d === 1
                    ? 'Virtue'
                    : d === 2
                    ? 'Vice'
                    : 'Both';
                })
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              // For all
              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp')
                .data(pdpValuesForClusters[clusterId]['all'][d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp')
                .attr('x', 2)
                .attr(
                  'y',
                  e => yPDFairnessFeatureValueScale(e.featureValue) - 5
                )
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 10)
                .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
                // .style('stroke-width', 4)
                .style('fill', 'rgb(190, 255, 231)')
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_con')
                .data(pdpValuesForClusters[clusterId]['con'][d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_con')
                .attr('x', 2)
                .attr(
                  'y',
                  e => yPDFairnessFeatureValueScale(e.featureValue) - 5
                )
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.con).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.con)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);

              d3.select('.g_feature_axis_' + d.key)
                .selectAll('.rect_pdp_for_lib')
                .data(pdpValuesForClusters[clusterId]['lib'][d.key])
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_for_lib')
                .attr('x', 2)
                .attr('y', e => yPDFairnessFeatureValueScale(e.featureValue))
                .attr('width', e => xPDProbScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.group.lib).darker())
                // .style('stroke-width', 4)
                .style('fill', globalColors.group.lib)
                // .style('stroke-dasharray', '8,3')
                // .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.5);
              // For valence and dominance, add linear scale + line chart
            } else {
              yAxisSetting = d3
                .axisLeft(yVDScale)
                .tickValues(d3.range(0, 1.1, 0.2))
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              //// Add a path (to draw a separate line), and also area (to fill the area)
              /// For all

              const pdpPathDatumForAll = d3
                .select('.path_pdp_' + d.key)
                .datum(pdpValuesForClusters[clusterId]['all'][d.key]);

              pdpPathDatumForAll.exit().remove();
              pdpPathDatumForAll.attr('d', drawPDPLine);

              const pdpAreaDatumForAll = d3
                .select('.area_pdp_' + d.key)
                .datum(pdpValuesForClusters[clusterId]['all'][d.key]);

              pdpAreaDatumForAll.exit().remove();
              pdpAreaDatumForAll.attr('d', drawPDPArea);

              const pdpPathDatumForCon = d3
                .select('.path_pdp_for_con_' + d.key)
                .datum(pdpValuesForClusters[clusterId]['con'][d.key]);

              pdpPathDatumForCon.exit().remove();
              pdpPathDatumForCon.attr('d', drawPDPLine);

              const pdpAreaDatumForCon = d3
                .select('.area_pdp_for_con_' + d.key)
                .datum(pdpValuesForClusters[clusterId]['con'][d.key]);

              pdpAreaDatumForCon.exit().remove();
              pdpAreaDatumForCon.attr('d', drawPDPArea);

              const pdpPathDatumForLib = d3
                .selectAll('.path_pdp_for_lib_' + d.key)
                .datum(pdpValuesForClusters[clusterId]['lib'][d.key]);

              pdpPathDatumForLib.exit().remove();
              pdpPathDatumForLib.attr('d', drawPDPLine);

              const pdpAreaDatumForLib = d3
                .selectAll('.area_pdp_for_lib_' + d.key)
                .datum(pdpValuesForClusters[clusterId]['lib'][d.key]);

              pdpAreaDatumForLib.exit().remove();
              pdpAreaDatumForLib.attr('d', drawPDPArea);

              // // path
              // d3.select('.g_feature_axis_' + d.key)
              //   .append('path')
              //   .datum(pdpValuesForClusters[clusterId]['all'][d.key])
              //   .attr('class', 'path_pdp_' + d.key)
              //   .attr('d', drawPDPLine)
              //   .style('stroke', 'rgb(190, 255, 231)')
              //   .style('stroke-width', 4)
              //   .style('fill', 'none')
              //   // .style('stroke-dasharray', '8,3')
              //   .style('shape-rendering', 'crispedges')
              //   .style('opacity', 1);

              // // area
              // d3.select('.g_feature_axis_' + d.key)
              //   .append('path')
              //   .datum(pdpValuesForClusters[clusterId]['all'][d.key])
              //   .attr('class', 'area_pdp_' + d.key)
              //   .attr('d', drawPDPArea)
              //   .style('stroke', 'none')
              //   .style('fill', 'gray')
              //   .style('stroke-dasharray', '8,3')
              //   .style('shape-rendering', 'crispedges')
              //   .style('fill-opacity', 0.3);

              // /// Path
              // // For con
              // d3.select('.g_feature_axis_' + d.key)
              //   .append('path')
              //   .datum(pdpValuesForClusters[clusterId]['con'][d.key])
              //   .attr('class', 'path_pdp_for_con_' + d.key)
              //   .attr('d', drawPDPLine)
              //   .style('stroke', globalColors.group.con)
              //   .style('stroke-width', 2)
              //   .style('fill', 'none')
              //   // .style('stroke-dasharray', '8,3')
              //   .style('shape-rendering', 'crispedges')
              //   .style('opacity', 1);

              // /// For lib
              // d3.select('.g_feature_axis_' + d.key)
              //   .append('path')
              //   .datum(pdpValuesForClusters[clusterId]['lib'][d.key])
              //   .attr('class', 'path_pdp_for_lib_' + d.key)
              //   .attr('d', drawPDPLine)
              //   .style('stroke', globalColors.group.lib)
              //   .style('stroke-width', 2)
              //   .style('fill', 'none')
              //   // .style('stroke-dasharray', '8,3')
              //   .style('shape-rendering', 'crispedges')
              //   .style('opacity', 1);

              // /// Area
              // // For con
              // d3.select('.g_feature_axis_' + d.key)
              //   .append('path')
              //   .datum(pdpValuesForClusters[clusterId]['con'][d.key])
              //   .attr('class', 'area_pdp_for_con_' + d.key)
              //   .attr('d', drawPDPArea)
              //   .style('stroke', 'none')
              //   .style('fill', globalColors.group.con)
              //   .style('stroke-dasharray', '8,3')
              //   .style('shape-rendering', 'crispedges')
              //   .style('fill-opacity', 0.3);

              // // For lib
              // d3.select('.g_feature_axis_' + d.key)
              //   .append('path')
              //   .datum(pdpValuesForClusters[clusterId]['lib'][d.key])
              //   .attr('class', 'area_pdp_for_lib_' + d.key)
              //   .attr('d', drawPDPArea)
              //   .style('stroke', 'none')
              //   .style('fill', globalColors.group.lib)
              //   .style('stroke-dasharray', '8,3')
              //   .style('shape-rendering', 'crispedges')
              //   .style('fill-opacity', 0.3);
            }
          });
        } // end of else click
      }
    }, [
      tweets,
      clusters,
      words,
      selectedFeatures,
      isLoaded,
      pdpValues,
      ref.current
    ]);

    d3.selectAll('canvas').remove();

    return (
      <FeaturePlotViewWrapper
        ref={ref}
        // width={wholeWidth}
        // height={wholeHeight}
        // style={{ display: 'flex' }}
      >
        <svg
          // width={layout.width + layout.margin.left + layout.margin.right}
          // height={layout.height + layout.margin.top + layout.margin.bottom}
          width={wholeWidth}
          height={wholeHeight}
          viewBox={'0 0 ' + wholeWidth + ' ' + wholeHeight}
          preserveAspectRatio="xMinYMin"
          ref={ref2}
        />
      </FeaturePlotViewWrapper>
    );
  }
);

export default FeaturePlotView;

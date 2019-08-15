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
  width: 640,
  height: 240,
  leftMargin: 50,
  innerHeight: 340 - 2,
  featurePlot: {
    width: 350
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

const color = d3
  .scaleOrdinal()
  .domain([
    'Radial Velocity',
    'Imaging',
    'Eclipse Timing constiations',
    'Astrometry',
    'Microlensing',
    'Orbital Brightness Modulation',
    'Pulsar Timing',
    'Pulsation Timing constiations',
    'Transit',
    'Transit Timing constiations'
  ])
  .range([
    '#DB7F85',
    '#50AB84',
    '#4C6C86',
    '#C47DCB',
    '#B59248',
    '#DD6CA7',
    '#E15E5A',
    '#5DA5B3',
    '#725D82',
    '#54AF52',
    '#954D56',
    '#8C92E8',
    '#D8597D',
    '#AB9C27',
    '#D67D4B',
    '#D58323',
    '#BA89AD',
    '#357468',
    '#8F86C2',
    '#7D9E33',
    '#517C3F',
    '#9D5130',
    '#5E9ACF',
    '#776327',
    '#944F7E'
  ]);

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
    tweets,
    clusters,
    words,
    selectedFeatures,
    isLoaded,
    pdpValues,
    pdpValuesForCon,
    pdpValuesForLib
  }) => {
    const dispatch = useDispatch();
    const ref = useRef(null),
      ref2 = useRef(null);

    const numFeatures = selectedFeatures.length;

    // prettier-ignore
    const tweetsCorrectPred = tweets.filter(d => d.group === d.pred),
    tweetsWrongPred = tweets.filter(d => (d.group !== d.pred)),
    tweetsConWrongPred = tweets.filter(d => (d.group !== d.pred) && (d.group === '0')),
    tweetsLibWrongPred = tweets.filter(d => (d.group !== d.pred) && (d.group === '1'));

    useEffect(() => {
      console.log('in featureplotview useeffect: ', isLoaded);
      console.log('in featureplotview useeffect: ', clusters);
      console.log('in featureplotview useeffect: ', tweets);
      const xFeatureScale = d3
        .scalePoint()
        .domain(selectedFeatures.map(({ key }) => key))
        .range([layout.margin.left, layout.featurePlot.width]);

      const yScoreScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([layout.height, layout.margin.top]);

      const yHarmScale = d3
        .scaleLinear()
        .domain([0, 3])
        .range([layout.height, layout.margin.top]);

      const xPDProbScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([0, layout.margin.left]);

      const yPDFeatureValueScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([layout.height, layout.margin.top]);

      const yPDHarmFeatureValueScale = d3
        .scaleLinear()
        .domain([0, 3])
        .range([layout.height, layout.margin.top]);

      const yAxis = d3.axisLeft();

      const container = d3.select(ref.current),
        svg = d3.select(ref2.current);

      // Clean up old elements before update
      d3.selectAll('.g_feature_plot').remove();
      d3.selectAll('.g_cluster_plot').remove();
      d3.selectAll('.g_output_prob_plot').remove();
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

      const yOutputProbHistBinScale = d3
        .scaleBand()
        .domain(dataBinCorrectPredTweets.map(d => d.x0).reverse()) // From 1 to 0
        .range([layout.margin.top, layout.outputProbPlot.height]);

      const yOutputProbSetting = d3
        .axisLeft(yOutputProbScale)
        .tickValues([0, 0.5, 1]);

      const yOutputProbAxis = gOutputProbPlot
        .append('g')
        .call(yOutputProbSetting)
        .attr('class', 'g_output_prob_axis')
        .attr(
          'transform',
          'translate(' + layout.outputProbPlot.width / 2 + ',' + 0 + ')'
        );

      const outputProbTitle = gOutputProbPlot
          .append('text')
          .text('Output')
          .attr('x', 10)
          .attr('y', 10),
        textWrong = gOutputProbPlot
          .append('text')
          .text('Wrong')
          .attr('x', -5)
          .attr('y', 23)
          .style('font-size', '0.8rem'),
        textCorrect = gOutputProbPlot
          .append('text')
          .text('Correct')
          .attr('x', 40)
          .attr('y', 23)
          .style('font-size', '0.8rem');

      const tweetHistForCorrectPred = gOutputProbPlot
        .append('g')
        .attr('class', 'g_output_prob_hist_for_correct_pred')
        .attr('transform', d => {
          return 'translate(' + layout.outputProbPlot.width / 2 + ',' + 0 + ')';
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

      const tweetLibHistForWrongPred = gOutputProbPlot
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

      const tweetConHistForWrongPred = gOutputProbPlot
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

      const featureToOutputLines = gFeatureToOutputLines
        .selectAll('.line_feature_to_output')
        .data(tweets)
        .enter()
        .append('line')
        .attr(
          'class',
          d => 'line_feature_to_output line_feature_to_output_' + d.clusterId
        )
        .attr('x1', xFeatureToOutputScale(0))
        .attr('y1', d => yScoreScale(d.fairness))
        .attr('x2', d => xFeatureToOutputScale(1))
        .attr('y2', d => yOutputProbScale(d.prob))
        .style('stroke', d =>
          d.group === d.pred
            ? groupColorScale(d.group)
            : groupWrongColorScale(d.group)
        )
        // .style('stroke-dasharray', d => (d.group === d.pred ? 'none' : '4,5'))
        .style('stroke-width', 0.3)
        .style('opacity', d => 0.3);

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
        .style('top', -container.node().offsetHeight + 5 + 'px')
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
              d.key === 'harm'
                ? yPDHarmFeatureValueScale(e.featureValue)
                : yPDFeatureValueScale(e.featureValue)
            )
            .curve(d3.curveCatmullRom);

          const drawPDPArea = d3
            .area()
            .x0(0)
            .x1(e => xPDProbScale(e.pdpValue))
            .y(e =>
              d.key === 'harm'
                ? yPDHarmFeatureValueScale(e.featureValue)
                : yPDFeatureValueScale(e.featureValue)
            )
            .curve(d3.curveCatmullRom);

          // For harm and fairness, add ordinal scale + bar chart
          if (i === 2) {
            yAxisSetting = d3
              .axisLeft(yHarmScale)
              .tickValues([0, 1, 2, 3])
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
              .attr('y', e => yPDHarmFeatureValueScale(e.featureValue) - 5)
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
              .attr('y', e => yPDHarmFeatureValueScale(e.featureValue) - 5)
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
              .attr('y', e => yPDHarmFeatureValueScale(e.featureValue))
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
              .axisLeft(yScoreScale)
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

            /// For con
            // path
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

            // area
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

            /// For lib
            // path
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

            // area
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

          console.log('in axes: ', pdpValues[d.key], d);
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

      d3.selectAll('.axis.pl_discmethod .tick text').style('fill', color);

      // For feature plots
      function project(d) {
        return selectedFeatures.map(function(p, i) {
          // check if data element has property and contains a value
          if (!(p.key in d) || d[p.key] === null) return null;

          return p.key === 'harm'
            ? [xFeatureScale(p.key), yHarmScale(d[p.key])]
            : [xFeatureScale(p.key), yScoreScale(d[p.key])];
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
          return (
            extent[0] <= yScoreScale(value) && yScoreScale(value) <= extent[1]
          );
        }

        const selected = tweets.filter(function(d) {
          if (
            actives.every(function(active) {
              const dim = active.dimension;
              // test if point is within extents for each active brush
              console.log(
                'brushh: ',
                d,
                dim,
                xFeatureScale(d[dim.key]),
                active.extent
              );
              return within(d[dim.key], active.extent, dim);
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
        .y((d, i) => (i === 2 ? yHarmScale(d[1]) : yScoreScale(d[1])));

      console.log('clusters: ', clusters);

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
      .on('click', function(d, i) {
          const selectedCluster = d3.select(this),
                clusterId = d.clusterId;
          if (selectedCluster.classed('cluster_selected') === true) {
              // Put back the tweetList with entire tweets
              dispatch({
                type: 'LIST_TWEETS_IN_CL',
                payload: tweets
              });

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

              d3.selectAll('.line_feature_to_output')
                .style('opacity', 0.3);

                d3.selectAll('.g_output_prob_hist_for_correct_pred').remove();
                d3.selectAll('.g_output_prob_hist_for_wrong_pred').remove();
                d3.selectAll('.g_output_prob_hist_for_correct_pred_for_cluster').remove();
                d3.selectAll('.g_output_prob_con_hist_for_lib_wrong_pred_for_cluster').remove();
                d3.selectAll('.g_output_prob_lib_hist_for_lib_wrong_pred_for_cluster').remove();

              // To put back the output prob plot
              const tweetsCorrectPredForCluster = tweetsCorrectPred.filter(
                e => e.clusterId === clusterId
              );

              const dataBinCorrectPredTweetsForCluster = d3
                .histogram()
                .domain([0, 1])
                .value(d => d.prob)
                .thresholds(d3.range(0, 1, 0.05))(tweetsCorrectPred);

              const dataBinWrongPredTweetsForCluster = d3
                .histogram()
                .domain([0, 1])
                .value(d => d.prob)
                .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

              gOutputProbPlot
                .append('g')
                .attr('class', 'g_output_prob_hist_for_correct_pred')
                .attr('transform', d => {
                  return (
                    'translate(' + layout.outputProbPlot.width / 2 + ',' + 0 + ')'
                  );
                })
                .selectAll('.rect_output_prob_hist_for_correct_pred')
                .data(dataBinCorrectPredTweetsForCluster)
                .enter()
                .append('rect')
                .attr('class', 'rect_output_prob_hist_for_correct_pred')
                .attr('x', 3)
                .attr('y', d => {
                  console.log('y=x0: ', d.x0);
                  console.log(yOutputProbHistBinScale(d.x0));
                  return yOutputProbHistBinScale(d.x0);
                })
                .attr('width', d => xOutputProbCorrectHistScale(d.length))
                .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
                .style('fill', d =>
                  d.x0 >= 0.5 ? globalColors.group.lib : globalColors.group.con
                )
                .style('opacity', 0.3);

              const tweetLibHistForWrongPred = gOutputProbPlot
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
        
              const tweetConHistForWrongPred = gOutputProbPlot
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
          } else {
            const clusterId = d.clusterId,
              tweetsInCluster = tweets.filter(e => e.clusterId === clusterId);

              // List tweets within this cluster in tweetList
              dispatch({
                type: 'LIST_TWEETS_IN_CL',
                payload: tweetsInCluster
              });

              // Remove previous elements
              gFeaturePlot.selectAll('.path_tweet').remove();

              d3.selectAll('.g_output_prob_hist_for_correct_pred').remove();
              d3.selectAll('.g_output_prob_con_hist_for_lib_wrong_pred').remove();
              d3.selectAll('.g_output_prob_con_hist_for_con_wrong_pred').remove();

              d3.selectAll('.g_output_prob_hist_for_correct_pred_for_cluster').remove();
              d3.selectAll('.g_output_prob_hist_for_con_wrong_pred_for_cluster').remove();
              d3.selectAll('.g_output_prob_hist_for_lib_wrong_pred_for_cluster').remove();

              d3.selectAll('.cluster_selected')
                .style('stroke', 'gray')
                .style('stroke-width', '1px')
                .classed('cluster_selected', false);

              d3.selectAll('.cluster_output_prob_rect_selected')
                .style('stroke', 'gray')
                .style('stroke-width', '1px')
                .classed('cluster_output_prob_rect_selected', false);

              d3.selectAll('.line_feature_to_output')
                .style('opacity', 0);

              // Highlight selected cluster
              selectedCluster.classed('cluster_selected', true);
              selectedCluster
                .style('stroke-width', '3px')
                .style('stroke', 'black');

              d3.select('.cluster_output_prob_rect_' + i)
                .style('stroke', 'black')
                .style('stroke-width', '2px')
                .classed('cluster_output_prob_rect_selected', true);

              d3.selectAll('.line_feature_to_output_' + i)
                .style('opacity', 0.3);

              // To highlight the paths
              console.log('mouseovered');
              console.log(d);
              console.log(tweets);
              console.log(tweetsInCluster);

              const tweetsPathData = tweetsInCluster.map(d => {
                const tweetWithSelectedFeatures = _.pick(
                  d,
                  selectedFeatures.map(({ key }) => key)
                );
                var tweetPathData = Object.entries(tweetWithSelectedFeatures);
                tweetPathData.group = d.group;

                return tweetPathData;
              });

              console.log('tweetsPathData: ', tweetsPathData);

              gFeaturePlot
                .selectAll('.path_tweet')
                .data(tweetsPathData)
                .enter()
                .append('path')
                .attr('class', 'path_tweet')
                .attr('d', drawTweetLine)
                .style('stroke', d => groupColorScale(d.group))
                .style('fill', 'none')
                .style('stroke-width', 0.3)
                .style('opacity', 0.3);

              d3.select('canvas')
                .style('opacity', 0.1);

              // To adjust the output prob plot
              const tweetsCorrectPredForCluster = tweetsCorrectPred.filter(
                e => e.clusterId === clusterId
              );
              const tweetsConWrongPredForCluster = tweetsWrongPred.filter(
                e => (e.clusterId === clusterId && e.group === '0')
              );
              const tweetsLibWrongPredForCluster = tweetsWrongPred.filter(
                e => (e.clusterId === clusterId && e.group === '0')
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

              gOutputProbPlot
                .append('g')
                .attr('class', 'g_output_prob_hist_for_correct_pred_for_cluster')
                .attr('transform', d => {
                  return (
                    'translate(' + layout.outputProbPlot.width / 2 + ',' + 0 + ')'
                  );
                })
                .selectAll('.g_output_prob_hist_for_correct_pred_for_cluster')
                .data(dataBinCorrectPredTweetsForCluster)
                .enter()
                .append('rect')
                .attr('class', 'g_output_prob_hist_for_correct_pred_for_cluster')
                .attr('x', 3)
                .attr('y', d => {
                  console.log('y=x0: ', d.x0);
                  console.log(yOutputProbHistBinScale(d.x0));
                  return yOutputProbHistBinScale(d.x0);
                })
                .attr('width', d => xOutputProbCorrectHistScale(d.length))
                .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
                .style('fill', d =>
                  d.x0 >= 0.5 ? globalColors.group.lib : globalColors.group.con
                )
                .style('opacity', 0.3);

              const tweetLibHistForWrongPredForCluster = gOutputProbPlot
                .append('g')
                .attr('class', 'g_output_prob_con_hist_for_lib_wrong_pred_for_cluster')
                .attr('transform', d => {
                  return 'translate(' + 0 + ',' + 0 + ')';
                })
                .selectAll('.rect_output_prob_hist_for_lib_wrong_pred_for_cluster')
                .data(dataBinConWrongPredTweetsForCluster)
                .enter()
                .append('rect')
                .attr('class', 'rect_output_prob_hist_for_lib_wrong_for_cluster')
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
        
              const tweetConHistForWrongPredForCluster = gOutputProbPlot
                .append('g')
                .attr('class', 'g_output_prob_con_hist_for_con_wrong_pred_for_cluster')
                .attr('transform', d => {
                  return 'translate(' + 0 + ',' + 0 + ')';
                })
                .selectAll('.rect_output_prob_hist_for_con_wrong_pred_for_cluster')
                .data(dataBinLibWrongPredTweetsForCluster)
                .enter()
                .append('rect')
                .attr('class', 'rect_output_prob_hist_for_con_wrong_pred_for_cluster')
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
      });

      const clusterTitle = gClusterPlot
        .append('text')
        .text('Cluster')
        .attr('y', 10);

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
        .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib]);

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
          (d, i) => 'cluster_output_prob_rect cluster_output_prob_rect_' + i
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

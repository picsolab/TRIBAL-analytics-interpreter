import * as d3 from 'd3';
import _ from 'lodash';

import Axes from './Axes';
import { globalColors, l, lCom } from '../../GlobalStyles';
import { globalScales } from '../../GlobalScales';

let layout = {
  featurePlot: {
    width: 450,
    height: 240
  },
  outputProbPlot: {
    width: 70,
    height: 240,
    leftMargin: 80,
    minRadius: 4,
    maxRadius: 10
  }
};

function Level2Plot() {
  var width = 720,
    height = 80,
    rectWidth = 100;

  let dataLoader = [];

  let xOutputProbCorrectHistScale = '';
  let xOutputProbWrongHistScale = '';
  let yOutputProbScale = '';
  let yGroupScale = '';
  let yOutputProbHistBinScale = '';
  let xFeatureScale = '';
  let groupColorScale = '';

  function _level2Plot(selection) {
    const globalMode = 1;
    const [
      groups,
      tweets,
      features,
      pdpValues,
      pdpValuesForGroups,
      dataBinCorrectPredTweets,
      dataBinConWrongPredTweets,
      dataBinLibWrongPredTweets
    ] = dataLoader;

    const xFeatureScaleBandwidth =
      xFeatureScale(features[1].key) - xFeatureScale(features[0].key);

    const axes = Axes();

    const yOutputProbSetting = d3
      .axisLeft(yOutputProbScale)
      .tickValues([0, 0.5, 1]);

    //* OutputProbPlot
    selection
      .append('text')
      .text('Output')
      .attr('x', 15)
      .attr('y', -l.textHeight * 2 - 5)
      .style('fill', 'gray');

    groups.forEach((group, groupIdx) => {
      const gOutputProbPlot = selection
        .append('g')
        .attr('class', 'g_output_prob_plot')
        .attr(
          'transform',
          'translate(' +
            lCom.outputProbPlot.l +
            ',' +
            yGroupScale(groupIdx) +
            ')'
        );

      gOutputProbPlot
        .append('text')
        .text(group.name)
        .attr('x', 20)
        .attr('y', -l.textHeight)
        .style('font-size', '0.8rem')
        .style('fill', 'gray');

      gOutputProbPlot
        .append('g')
        .call(yOutputProbSetting)
        .attr('class', 'g_output_prob_axis')
        .attr(
          'transform',
          'translate(' + lCom.outputProbPlot.w / 2 + ',' + 0 + ')'
        );
      // tweetHistForCorrectPred
      gOutputProbPlot
        .append('g')
        .attr('class', 'g_output_prob_for_wrong_pred_')
        .attr('transform', d => {
          return 'translate(' + lCom.outputProbPlot.w / 2 + ',' + 0 + ')';
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
        .style('fill', globalColors.groups[groupIdx].color)
        .style('opacity', 0.5);

      // tweetLibHistForWrongPred
      gOutputProbPlot
        .append('g')
        .attr('class', 'g_output_prob_for_wrong_pred_' + group.abbr)
        .attr('transform', d => {
          return 'translate(' + 0 + ',' + 0 + ')';
        })
        .selectAll('.rect_output_prob_for_wrong_pred_')
        .data(
          group.abbr === 'lib'
            ? dataBinLibWrongPredTweets
            : dataBinConWrongPredTweets
        )
        .enter()
        .append('rect')
        .attr('class', 'rect_output_prob_for_wrong_pred_')
        .attr(
          'x',
          d =>
            lCom.outputProbPlot.w / 2 - 3 - xOutputProbWrongHistScale(d.length)
        )
        .attr('y', d => yOutputProbHistBinScale(d.x0))
        .attr('width', d => xOutputProbWrongHistScale(d.length))
        .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
        .style('fill', d => globalColors.groups[groupIdx].colorForWrong)
        .style('opacity', 0.5);
    });

    //* FeaturePlot
    const gFeaturePlot = selection.append('g').attr('class', 'g_feature_plot');

    //* Axes
    const axesData = gFeaturePlot
      .selectAll('.axis')
      .data(features)
      .call(
        axes
          .dataForFeatures(features)
          .dataForPdpValues(pdpValues)
          .dataForPdpValuesForGroups(pdpValuesForGroups)
          .xFeatureScale(xFeatureScale)
          .width(15)
      );

    const featureTitleData = gFeaturePlot
      .selectAll('text')
      .data(features)
      .enter();

    featureTitleData // feature title text
      .append('text')
      .text(d => d.abbr)
      .attr('x', (d, i) => xFeatureScale(d.key) - 10)
      .attr('y', (d, i) => 10)
      .style('font-size', '0.8rem');

    //* Render tweet lines
    const drawTweetLine = d3
      .linkHorizontal()
      .x(d => d.x)
      .y(d => d.y);

    const gTweetLinesForFeatures = gFeaturePlot
      .selectAll('.g_tweet_line')
      .data(features)
      .enter()
      .append('g')
      .attr('transform', function(d, i) {
        return (
          'translate(' +
          (xFeatureScale(d.key) + lCom.hPlot.featurePlot.axis.w) +
          ')'
        );
      });

    // Prepare data for linkHorizontal
    gTweetLinesForFeatures.each(function(feature, feature_idx) {
      if (feature_idx !== features.length - 1) {
        // Except for the last feature
        const gFeatureSelected = d3.select(this);
        const currentFeature = feature,
          nextFeature = features[feature_idx + 1];
        const currentFeatureScale = feature.scale,
          nextFeatureScale = nextFeature.scale;

        const dataForLines = tweets.map(d => ({
          group: d.group,
          source: { x: 0, y: currentFeatureScale(d[currentFeature.key]) },
          target: {
            x: xFeatureScaleBandwidth - lCom.hPlot.featurePlot.axis.w,
            y: nextFeatureScale(d[nextFeature.key])
          }
        }));

        gFeatureSelected
          .selectAll('.tweet_lines')
          .data(dataForLines)
          .enter()
          .append('path')
          .attr('class', 'tweet_lines')
          .attr('d', drawTweetLine)
          .style('fill', 'none')
          .style('stroke', d => groupColorScale(d.group))
          .style('opacity', 0.2);

        // gFeatureSelected
        //   .selectAll('.tweet_lines')
        //   .data(tweets)
        //   .enter()
        //   .append('line')
        //   .attr('class', (d, i) => 'tweet_lines tweet_lines_' + i)
        //   .attr('x1', d => 0)
        //   .attr('y1', (d, i) => currentFeatureScale(d[currentFeature.key]))
        //   .attr(
        //     'x2',
        //     d => xFeatureScaleBandwidth - lCom.hPlot.featurePlot.axis.w
        //   )
        //   .attr('y2', (d, i) => nextFeatureScale(d[nextFeature.key]))
        //   .style('stroke', d => groupColorScale(d.group))
        //   .style('opacity', 0.2);
      }
    });
  }

  _level2Plot.dataLoader = function(value) {
    if (!arguments.length) return dataLoader;
    dataLoader = value;
    return _level2Plot;
  };

  _level2Plot.xOutputProbCorrectHistScale = function(value) {
    if (!arguments.length) return xOutputProbCorrectHistScale;
    xOutputProbCorrectHistScale = value;
    return _level2Plot;
  };

  _level2Plot.xOutputProbWrongHistScale = function(value) {
    if (!arguments.length) return xOutputProbWrongHistScale;
    xOutputProbWrongHistScale = value;
    return _level2Plot;
  };

  _level2Plot.yOutputProbScale = function(value) {
    if (!arguments.length) return yOutputProbScale;
    yOutputProbScale = value;
    return _level2Plot;
  };

  _level2Plot.yGroupScale = function(value) {
    if (!arguments.length) return yGroupScale;
    yGroupScale = value;
    return _level2Plot;
  };

  _level2Plot.yOutputProbHistBinScale = function(value) {
    if (!arguments.length) return yOutputProbHistBinScale;
    yOutputProbHistBinScale = value;
    return _level2Plot;
  };

  _level2Plot.xFeatureScale = function(value) {
    if (!arguments.length) return xFeatureScale;
    xFeatureScale = value;
    return _level2Plot;
  };

  _level2Plot.groupColorScale = function(value) {
    if (!arguments.length) return groupColorScale;
    groupColorScale = value;
    return _level2Plot;
  };

  return _level2Plot;
}

export default Level2Plot;

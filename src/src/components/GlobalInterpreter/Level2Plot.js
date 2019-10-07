import * as d3 from 'd3';
import _ from 'lodash';

import Axes from './Axes';
import { globalColors } from '../../GlobalStyles';

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

  let relevantData = [];
  let dataForFeatures = [];
  let dataForPdpValues = [];
  let dataForPdpValuesForGroups = [];

  var xOutputProbCorrectHistScale = '';
  var xOutputProbWrongHistScale = '';
  var yOutputProbScale = '';
  var yGroupScale = '';
  var yOutputProbHistBinScale = '';
  var xFeatureScale = '';

  function _level2Plot(selection) {
    const globalMode = 1;
    const [
      dataBinCorrectPredTweets,
      dataBinConWrongPredTweets,
      dataBinLibWrongPredTweets
    ] = relevantData;
    const features = dataForFeatures;
    const pdpValues = dataForPdpValues;
    const pdpValuesForGroups = dataForPdpValuesForGroups;

    const axes = Axes();

    const yOutputProbSetting = d3
      .axisLeft(globalMode === 0 ? yGroupScale : yOutputProbScale)
      .tickValues(globalMode === 0 ? [0, 1] : [0, 0.5, 1]);

    //* OutputProbPlot
    const gOutputProbPlot = selection
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

      //* OutputProbPlot
      const gFeaturePlot = selection
        .append('g')
        .attr('class', 'g_feature_plot');

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
    }
  }

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

  _level2Plot.relevantData = function(value) {
    if (!arguments.length) return relevantData;
    relevantData = value;
    return _level2Plot;
  };

  _level2Plot.dataForFeatures = function(value) {
    if (!arguments.length) return dataForFeatures;
    dataForFeatures = value;
    return _level2Plot;
  };

  _level2Plot.dataForPdpValues = function(value) {
    if (!arguments.length) return dataForPdpValues;
    dataForPdpValues = value;
    return _level2Plot;
  };

  _level2Plot.dataForPdpValuesForGroups = function(value) {
    if (!arguments.length) return dataForPdpValuesForGroups;
    dataForPdpValuesForGroups = value;
    return _level2Plot;
  };

  return _level2Plot;
}

export default Level2Plot;

import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, l, ll, lCom} from '../../GlobalStyles';
import {globalScales} from '../../GlobalScales';

const layout = {
  wordPlot: {
    w: 800,
    h: 100
  },
  word: {
    w: 20,
    h: 20,
    m: {
      r: 10
    }
  }
};

function Level1Plot() {
  let dataForGoals = []; // [ 'emotion', 'moral' ]
  let dataForClusterForGoals = [];
  let dataForFeatures = [];
  let xGoalScale = '';
  let xClusterPerGoalScale = '';

  function _level1Plot(selection) {
    const goals = dataForGoals,
      clustersForGoals = dataForClusterForGoals,
      features = dataForFeatures;

    // Render goal bars
    selection
      .selectAll('.goal_rect')
      .data(goals)
      .enter()
      .append('rect')
      .attr('class', 'goal_rect')
      .attr('x', (d, i) => xGoalScale(d))
      .attr('y', lCom.hPlot.goalPlot.goalRect.t)
      .attr('width', (d, i) =>
        i == dataForGoals.length - 1 ? xGoalScale.bandwidth() : xGoalScale.bandwidth() - lCom.hPlot.goalPlot.m
      )
      .attr('height', lCom.hPlot.goalPlot.goalRect.h)
      .style('fill', 'black')
      .style('fill-opacity', 0.5)
      .style('stroke', 'none');

    selection
      .selectAll('.goal_title')
      .data(goals)
      .enter()
      .append('text')
      .attr('class', 'goal_title')
      .text(d => d)
      .attr('x', (d, i) => xGoalScale(d))
      .attr('y', lCom.hPlot.goalPlot.goalTitle.t + lCom.hPlot.goalPlot.goalTitle.textHeight)
      .style('font-style', 'italic');

    // Render goal cluster bars & goalClusterToFeature per goal lines
    clustersForGoals.forEach(function(d, i) {
      const goal = d.goal,
        goalIdx = i,
        clustersPerGoal = d.clusters;

      const gClsForGoal = selection
        .append('g')
        .attr('class', 'g_cluster_for_' + goal)
        .attr(
          'transform',
          'translate(' +
            xGoalScale.bandwidth() * i +
            ',' +
            (lCom.hPlot.goalPlot.goalRect.t + lCom.hPlot.goalPlot.goalRect.h + 5) +
            ')'
        );

      // Render goal cluster bars
      // gClsForGoal
      //   .selectAll('.cluster_bar_goal')
      //   .data(clustersPerGoal)
      //   .enter()
      //   .append('rect')
      //   .attr('class', (d, i) => 'cluster_bar_goal cluster_bar_goal_' + goal + '_cl_' + i)
      //   .attr('x', (d, i) => {
      //     console.log(d, i);
      //     let cumulativeXWidth = 0; // x coordinate is the cumulative width of previous rects

      //     if (i === 0) return 0;
      //     else {
      //       for (let j = i; j >= 1; j--) {
      //         cumulativeXWidth += xClusterPerGoalScale(clustersPerGoal[j - 1].countRatio);
      //       }
      //       return cumulativeXWidth;
      //     }
      //   })
      //   .attr('y', 0)
      //   .attr('width', d => xClusterPerGoalScale(d.countRatio) - l.sm)
      //   .attr('height', 5)
      //   .attr('fill', d => globalScales.groupRatioScale(d.group_lib_ratio))
      //   .attr('opacity', 0.8);

      // Render between G and F
      // Prepare data for linkHorizontal
      const goalsFeatures = [
        {goal: 'emotion', features: ['valence', 'dominance']},
        {goal: 'moral', features: ['care', 'fairness']}
      ];

      const featuresPerGoal = goalsFeatures[goalIdx].features;

      let dataForLinesPerGoal = [];
      const gPlot = d3.select('.g_h_plot');
      const gPlotOffset = gPlot.node().getBoundingClientRect();
      const gLinesFromGClToF = gPlot
        .append('g')
        .attr('class', 'g_lines_from_goal_cls_to_features')
        .attr('transform', 'translate(-25,5)');
      const drawGToFLine = d3
        .linkVertical()
        .x(d => d.x)
        .y(d => d.y);

      // clustersPerGoal.forEach((cluster, clusterIdx) => {
      //   featuresPerGoal.forEach((feature, featureIdx) => {
      //     const clBarOffset = d3
      //       .select('.cluster_bar_goal_' + goal + '_cl_' + clusterIdx)
      //       .node()
      //       .getBoundingClientRect();

      //     const xFeatureRect = d3
      //       .select('.axis_rect_' + feature)
      //       .node()
      //       .getBoundingClientRect();
      //     console.log('clBar: ', clBarOffset);
      //     console.log('xFeatureRect: ', xFeatureRect);

      //     const currentFeatureObj = features.filter(d => d.key == feature)[0];
      //     const currentFeatureScale = currentFeatureObj.scale
      //       .copy()
      //       .domain(features[featureIdx].domain)
      //       .range([0, xFeatureRect.width]);

      //     dataForLinesPerGoal.push({
      //       source: {
      //         // Coordinate for each cluster
      //         x: clBarOffset.x + clBarOffset.width / 2 - gPlotOffset.x,
      //         // position up to the cluster rect + cluster rect width/2
      //         y: clBarOffset.y - gPlotOffset.y
      //       },
      //       target: {
      //         // feature value on horizontal scale
      //         x:
      //           xFeatureRect.x +
      //           currentFeatureScale(cluster[feature]) -
      //           gPlotOffset.x,
      //         // position up to the axis + position of feature value within horizontal feature scale
      //         y: xFeatureRect.y - gPlotOffset.y
      //       }
      //     });

      //     gLinesFromGClToF
      //       .selectAll('.line_btn_G_and_F')
      //       .data(dataForLinesPerGoal)
      //       .enter()
      //       .append('path')
      //       .attr('class', 'line_btn_G_and_F')
      //       .attr('d', drawGToFLine)
      //       .style('fill', 'none')
      //       .style('stroke', d => 'black')
      //       .style('stroke-width', 2)
      //       .style('opacity', 0.2);
      //   });
      // });
    });
  }

  _level1Plot.dataForGoals = function(value) {
    if (!arguments.length) return dataForGoals;
    dataForGoals = value;
    return _level1Plot;
  };

  _level1Plot.dataForClusterForGoals = function(value) {
    if (!arguments.length) return dataForClusterForGoals;
    dataForClusterForGoals = value;
    return _level1Plot;
  };

  _level1Plot.dataForFeatures = function(value) {
    if (!arguments.length) return dataForFeatures;
    dataForFeatures = value;
    return _level1Plot;
  };

  _level1Plot.xGoalScale = function(value) {
    if (!arguments.length) return xGoalScale;
    xGoalScale = value;
    return _level1Plot;
  };

  _level1Plot.xClusterPerGoalScale = function(value) {
    if (!arguments.length) return xClusterPerGoalScale;
    xClusterPerGoalScale = value;
    return _level1Plot;
  };

  return _level1Plot;
}

export default Level1Plot;

import React, {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import {Button} from 'grommet';
import index from '../../index.css';
import {StylesContext} from '@material-ui/styles/StylesProvider';
import {globalColors, l, ll, lCom, SectionWrapper, SectionTitle, SubsectionTitle, SubTitle} from '../../GlobalStyles';
import {globalScales} from '../../GlobalScales';

import {renderQueue} from '../../lib/renderQueue';

import SeqPlotView from './SeqPlotView';

import Level1Plot from './Level1Plot';
import Level2Plot from './Level2Plot';
import Level3Plot from './Level3Plot';
import ClusterPlot from './ClusterPlot';
import ClusterPlotBefore from './ClusterPlotBefore';

const FeaturePlotViewWrapper = styled.div.attrs({
  className: 'feature_plot_view_wrapper'
})`
  grid-area: f;
  height: 100%;
  background-color: white;
  margin: 5px;
  padding: 5px;
  border: 0.5px solid lightgray;
`;

const EmptyIndicator = styled.div.attrs({
  className: 'h_empty_indicator'
})`
  margin-bottom: 5px;
`;

const Indicator = styled.div.attrs({
  className: 'h_indicator'
})`
  // width: 50px;
  border-left: 2px solid black;
  border-left: 2px solid #e8e8e8;
  text-align: center;
  background-color: whitesmoke;
  margin-right: 10px;
  padding: 0 5px;
  color: #929292;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.8rem;
`;

const layout = {
  margin: {top: 30, right: 110, bottom: 20, left: 30},
  width: 800,
  height: 450,
  leftMargin: 50,
  innerHeight: 340 - 2,
  l1: {
    h: 100
  },
  l2: {
    h: 240
  },
  l3: {
    h: 100
  },
  featurePlot: {
    width: 450,
    height: 240
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

const FeaturePlotView = React.memo(
  ({
    globalMode,
    goals,
    tweets,
    clusters,
    clustersForGoals,
    words,
    groups,
    features,
    isLoaded,
    pdpValues,
    pdpValuesForGroups,
    pdpValuesForCls,
    pdpValuesForClsGroups,
    currentModel,
    tfidf,
    cooc,
    isClusterSelected,
    wordsInTweets,
    tweetsInClusterForSeqPlot
  }) => {
    const dispatch = useDispatch();
    const ref = useRef(null),
      ref2 = useRef(null);

    // Set group color scale and save to global variable
    globalScales.groupColorScales = groups.map((group, groupIdx) => {
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range(['whitesmoke', globalColors.groups[groupIdx].color]);
    });

    useEffect(() => {
      const container = d3.select(ref.current),
        svg = d3.select(ref2.current).style('margin-left', 10);

      // // Clean up old elements before update
      d3.selectAll('.g_h_plot').remove();
      d3.selectAll('.g_cluster_plot').remove();

      //* Containers
      const gHPlot = svg
        .append('g')
        .attr('class', 'g_h_plot')
        .attr('transform', 'translate(' + lCom.hPlot.l + ',' + lCom.hPlot.t + ')');

      const gLevel1 = gHPlot
          .append('g')
          .attr('class', 'g_level1')
          .attr('transform', 'translate(' + 0 + ',' + ll.l1.t + ')'),
        gLevel2 = gHPlot
          .append('g')
          .attr('class', 'g_level2')
          .attr('transform', 'translate(' + 0 + ',' + ll.l2.t + ')');
      // gLevel3 = gHPlot
      //   .append('g')
      //   .attr('class', 'g_level3')
      //   .attr('transform', 'translate(' + 0 + ',' + ll.l3.t + ')');

      const goalPlot = Level1Plot();
      const featurePlot = Level2Plot();
      // const wordPlot = Level3Plot();

      //* Data
      // prettier-ignore
      const tweetsCorrPred = tweets.filter(d => d.group === d.pred),
        tweetsWrongPred = tweets.filter(d => (d.group !== d.pred));

      const tweetsConWrongPred = tweets.filter(d => d.group !== d.pred && d.group === '0'),
        tweetsLibWrongPred = tweets.filter(d => d.group !== d.pred && d.group === '1');

      const dataBinCorrPredTweets = d3
          .histogram()
          .domain([0, 1])
          .value(d => d.prob)
          .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred),
        dataBinWrongPredTweets = d3
          .histogram()
          .domain([0, 1])
          .value(d => d.prob)
          .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

      // For histogram scale
      const maxFreqCorr = _.max(dataBinCorrPredTweets.map(d => d.length)),
        maxFreqWrong = _.max(dataBinWrongPredTweets.map(d => d.length));

      let dataBinWrongPredTweetsForGroups = [];
      let dataBinCorrPredTweetsForGroups = [];
      groups.forEach((group, groupIdx) => {
        const tweetsCorrPred = tweets.filter(d => d.group === d.pred && d.group === groupIdx.toString()),
          tweetsWrongPred = tweets.filter(d => d.group !== d.pred && d.group === groupIdx.toString()),
          dataBinCorrPredTweets = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred),
          dataBinWrongPredTweets = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

        dataBinCorrPredTweetsForGroups.push(dataBinCorrPredTweets);
        dataBinWrongPredTweetsForGroups.push(dataBinWrongPredTweets);
      });
      // Settings for outputProbPlot
      // const dataBinCorrectPredTweets = d3
      //     .histogram()
      //     .domain([0, 1])
      //     .value(d => d.prob)
      //     .thresholds(d3.range(0, 1, 0.05))(tweetsCorrectPred),
      //   dataBinConWrongPredTweets = d3
      //     .histogram()
      //     .domain([0, 1])
      //     .value(d => d.prob)
      //     .thresholds(d3.range(0, 1, 0.05))(tweetsConWrongPred),
      //   dataBinLibWrongPredTweets = d3
      //     .histogram()
      //     .domain([0, 1])
      //     .value(d => d.prob)
      //     .thresholds(d3.range(0, 1, 0.05))(tweetsLibWrongPred);

      // const maxFreq = _.max(dataBinCorrectPredTweets.map(d => d.length)),
      //   maxFreqConWrong = _.max(dataBinConWrongPredTweets.map(d => d.length)),
      //   maxFreqLibWrong = _.max(dataBinLibWrongPredTweets.map(d => d.length));

      //* Scales
      const xFeatureScale = d3
        .scalePoint()
        .domain(features.map(({key}) => key))
        .range([0, lCom.hPlot.w]);

      features.forEach(feature => {
        const featureScale = feature.scale,
          pdScale = feature.pdScale;

        if (feature.type == 'continuous') {
          featureScale.domain(feature.domain).range([lCom.hPlot.featurePlot.h, 0]);
          pdScale.domain([0, 1]).range([0, lCom.hPlot.featurePlot.pdp.w]);
        } else if (feature.type == 'categorical') {
          const height = lCom.hPlot.featurePlot.h,
            topMargin = layout.margin.top,
            numCategory = feature.values.length;
          // rangeList = d3.range(numCategory).map(
          //   idx => height - (height / (numCategory - 1)) * idx // e.g., 100 - (100/3) * 1 - when there are 4 categories
          // );

          featureScale.domain(feature.domain).range([height, 0]);
          pdScale.domain([0, 1]).range([0, lCom.hPlot.featurePlot.pdp.w]);
        }
      });

      const groupColorScale = d3
        .scaleOrdinal()
        .domain([0, 1])
        .range(globalColors.groups.map(d => d.color));

      const groupColorScales = groups.map((group, group_idx) => {
        return d3
          .scaleLinear()
          .domain([0, 1])
          .range(['whitesmoke', globalColors.groups[group_idx].color]);
      });

      const groupWrongColorScale = d3
        .scaleOrdinal()
        .domain([1, 0])
        .range(['gray', globalColors.group.wrong.con]);

      const groupRatioScale = d3
        .scaleLinear()
        .domain([0, 0.5, 1])
        .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib]);

      // For level 1
      const xGoalScale = d3
        .scaleBand()
        .domain(goals)
        .range([0, lCom.hPlot.w + lCom.hPlot.featurePlot.axis.w]);

      const xClusterPerGoalScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([0, xGoalScale.bandwidth()]);

      // For level 2
      const xOutputProbHistScale = d3
        .scaleLinear()
        .domain([0, maxFreqCorr])
        .range([0, lCom.outputProbPlot.w / 2]);

      const yOutputProbScale = d3
        .scaleLinear()
        .domain([1, 0])
        .range([0, lCom.outputProbPlot.h]);

      const yGroupScale = d3 // Vertical position of outputProbPlot per group
        .scaleBand()
        .domain([0, 1])
        .range([0, lCom.outputProbPlot.h]);

      const yOutputProbHistScale = d3
        .scaleBand()
        .domain(dataBinCorrPredTweets.map(d => d.x0).reverse()) // From 1 to 0
        .range([0, lCom.outputProbPlot.h / 2 - 15]);

      // For level 3
      const xWordScale = d3
        .scaleBand()
        .domain(words.map(d => d.word))
        .range([0, lCom.hPlot.w]);

      //* Render the plots for each level
      gLevel2.call(
        featurePlot
          .dataLoader([
            groups,
            tweets,
            features,
            pdpValues,
            pdpValuesForGroups,
            // dataBinCorrPredTweets,
            // dataBinCorrPredTweetsForGroups,
            // dataBinWrongPredTweetsForGroups,
            tweetsCorrPred,
            tweetsConWrongPred,
            tweetsLibWrongPred
          ])
          .xFeatureScale(xFeatureScale)
          .xOutputProbHistScale(xOutputProbHistScale)
          .yOutputProbScale(yOutputProbScale)
          .yGroupScale(yGroupScale)
          .yOutputProbHistScale(yOutputProbHistScale)
          .groupColorScale(groupColorScale)
          .groupRatioScale(groupRatioScale)
      );

      gLevel1.call(
        goalPlot
          .dataForGoals(goals)
          .dataForClusterForGoals(clustersForGoals)
          .dataForFeatures(features)
          .xGoalScale(xGoalScale)
          .xClusterPerGoalScale(xClusterPerGoalScale)
      );

      // gLevel3.call(
      //   wordPlot
      //     .dataForWords(words)
      //     .dataForCooc(cooc)
      //     .xWordScale(xWordScale)
      //     .coocThreshold(0.2)
      // );

      //* Render components in between
      //* Render featuresToWords lines
      const lineFromFtoW = d3
        .line()
        .x(d => 20)
        .y(d => 30)
        .curve(d3.curveBasis);

      //const paths = gLevel3.append('path').attr('d', lineFromFtoW);

      //* Render featureToOutput lines
      const gFeatureToOutputLines = gLevel2
        .append('g')
        .attr('class', 'g_feature_to_output_paths')
        .attr('transform', 'translate(' + lCom.fromFtoO.l + ',0)');

      const xFeatureToOutputScale = d3
        .scaleOrdinal()
        .domain([0, 1])
        .range([0, lCom.fromFtoO.w]);

      const drawFeatureToOutputLines = d3
        .linkHorizontal()
        .x(d => d.x)
        .y(d => d.y);

      const lastFeature = features[features.length - 1];
      const dataFeatureToOutputLines = tweets.map(d => ({
        group: d.group,
        pred: d.pred,
        source: {
          x: xFeatureToOutputScale(0),
          y: lastFeature.scale(d[lastFeature.key]) + lastFeature.scale.bandwidth() / 2
        },
        target: {
          x: xFeatureToOutputScale(1),
          y: yOutputProbScale(d.prob)
        }
      }));

      const featureToOutputLinesData = gFeatureToOutputLines.selectAll('.line_feature_to_output').data(dataFeatureToOutputLines);
      // prettier-ignore
      featureToOutputLinesData
        .enter()
        .append('path')
        .attr('class', d => 'line_feature_to_output line_feature_to_output_' + d.clusterId)
        .attr('d', drawFeatureToOutputLines)
        .style('fill', 'none')
        .style('stroke', d =>
          d.group === d.pred
            ? groupColorScale(d.group)
            : groupWrongColorScale(d.group)
        )
        .style('stroke-width', 0.3)
        .style('opacity', d => 0.3);

      featureToOutputLinesData.attr('d', drawFeatureToOutputLines);

      featureToOutputLinesData.exit().remove();

      //8 For feature plots, render canvas paths
      // const render = renderQueue(draw).rate(30);

      // const devicePixelRatio = window.devicePixelRatio || 1;
      // const canvas = container
      //   .append('canvas')
      //   .attr('class', 'canvas_tweet_paths')
      //   .attr('width', lCom.hPlot.w)
      //   .attr('height', lCom.hPlot.featurePlot.h)
      //   .style('top', -lCom.hPlot.w + lCom.hPlot.featurePlot.t - 15 + 'px')
      //   .style('left', lCom.hPlot.l + 'px')
      //   .style('z-index', -1);

      // const ctx = canvas.node().getContext('2d');
      // // ctx.globalCompositeOperation = 'darken';
      // // ctx.globalAlpha = 1;
      // ctx.lineWidth = 0.7;
      // // ctx.clearRect(0, 0, layout.width, layout.height);
      // ctx.globalAlpha = d3.min([1.15 / Math.pow(tweets.length, 0.3), 1]);
      // render(tweets);

      // // Add and store a brush for each axis.
      // d3.selectAll('.axis')
      //   .append('g')
      //   .attr('class', 'brush')
      //   .each(function(d) {
      //     d3.select(this).call(
      //       (d.brush = d3
      //         .brushY()
      //         .extent([[-10, 0], [10, l.h]])
      //         .on('start', brushstart)
      //         .on('brush', brush)
      //         .on('end', brush))
      //     );
      //   })
      //   .selectAll('rect')
      //   .attr('x', -8)
      //   .attr('width', 16);

      // function project(d) {
      //   return features.map(function(feature, i) {
      //     // check if data element has property and contains a value
      //     if (!(feature.key in d) || d[feature.key] === null) return null;

      //     return [xFeatureScale(feature.key), feature.scale(d[feature.key])];
      //   });
      // }

      // function draw(d) {
      //   ctx.strokeStyle = groupColorScale(d.group);
      //   ctx.beginPath();
      //   const coords = project(d);
      //   coords.forEach(function(p, i) {
      //     // this tricky bit avoids rendering null values as 0
      //     if (p === null) {
      //       // this bit renders horizontal lines on the previous/next
      //       // dimensions, so that sandwiched null values are visible
      //       if (i > 0) {
      //         const prev = coords[i - 1];
      //         if (prev !== null) {
      //           ctx.moveTo(prev[0], prev[1]);
      //           ctx.lineTo(prev[0] + 6, prev[1]);
      //         }
      //       }
      //       if (i < coords.length - 1) {
      //         const next = coords[i + 1];
      //         if (next !== null) {
      //           ctx.moveTo(next[0] - 6, next[1]);
      //         }
      //       }
      //       return;
      //     }

      //     if (i == 0) {
      //       ctx.moveTo(p[0], p[1]);
      //       return;
      //     }

      //     ctx.lineTo(p[0], p[1]);
      //   });
      //   ctx.stroke();
      // }

      // function brushstart() {
      //   d3.event.sourceEvent.stopPropagation();
      // }

      // // Handles a brush event, toggling the display of foreground lines.
      // function brush() {
      //   render.invalidate();

      //   const actives = [];
      //   svg
      //     .selectAll('.axis .brush')
      //     .filter(function(d) {
      //       return d3.brushSelection(this);
      //     })
      //     .each(function(d) {
      //       actives.push({
      //         dimension: d,
      //         extent: d3.brushSelection(this)
      //       });
      //     });

      //   function within(value, extent, dim) {
      //     return (
      //       extent[0] <= features[dim].scale(value) &&
      //       features[dim].scale(value) <= extent[1]
      //     );
      //   }

      //   const selected = tweets.filter(function(d) {
      //     if (
      //       actives.every(function(active) {
      //         const dim = active.dimension;

      //         return within(d[dim.key], active.extent, dim.key);
      //       })
      //     ) {
      //       return true;
      //     }
      //   });

      //   // show ticks for active brush dimensions
      //   // and filter ticks to only those within brush extents
      //   /*
      // svg.selectAll('.axis')
      //     .filter(function(d) {
      //       return actives.indexOf(d) > -1 ? true : false;
      //     })
      //     .classed('active', true)
      //     .each(function(dimension, i) {
      //       const extent = extents[i];
      //       d3.select(this)
      //         .selectAll('.tick text')
      //         .style('display', function(d) {
      //           const value = dimension.type.coerce(d);
      //           return dimension.type.within(value, extent, dimension) ? null : 'none';
      //         });
      //     });

      // // reset dimensions without active brushes
      // svg.selectAll('.axis')
      //     .filter(function(d) {
      //       return actives.indexOf(d) > -1 ? false : true;
      //     })
      //     .classed('active', false)
      //     .selectAll('.tick text')
      //       .style('display', null);
      // */

      //   ctx.clearRect(0, 0, l.w, l.h);
      //   ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1]);
      //   render(selected);
      // } // end of brush()

      //* Render clusters
      // const clusterPlot = ClusterPlot();
      const clusterPlot = ClusterPlotBefore();

      const xClusterCoordScale = d3
        .scaleBand()
        .domain(clusters.map(d => d.clusterId))
        .range([0, lCom.clusterPlot.w]);

      const numTweetClusterScale = d3
        .scaleLinear()
        .domain(d3.extent(clusters.map(d => d.numTweets)))
        .range([lCom.clusterPlot.minR, lCom.clusterPlot.maxR]);

      const gClusterPlot = svg
        .append('g')
        .attr('class', 'g_cluster_plot')
        .attr(
          'transform',
          'translate(' + (lCom.clusterPlot.l + lCom.clusterPlot.maxR * 2 + 40) + ',' + (lCom.clusterPlot.maxR * 2 + 40) + ')'
        );

      // for ClusterPlotBefore
      const yClusterCoordScale = d3
        .scaleBand()
        .domain(clusters.map(d => d.clusterId))
        .range([0, lCom.clusterPlot.h]);

      gClusterPlot.call(
        clusterPlot
          .dataLoader([features, clusters, groups])
          .scaleLoader([xFeatureScale, yClusterCoordScale, numTweetClusterScale, groupRatioScale, groupColorScales])
          .updateOnClickCluster(updateOnClickCluster)
      );

      // if (globalMode !== 0) {
      //   //* Render Partial dependent plot (PDP)
      //   const gPDP = gLevel2
      //     .append('g')
      //     .attr('class', 'g_pdp')
      //     .attr(
      //       'transform',
      //       'translate(' + (lCom.pdpPlot.l + lCom.clusterPlot.maxR * 2) + ',0)'
      //     );

      //   const yClusterCoordpdScale = d3
      //     .scaleBand()
      //     .domain(clusters.map(d => d.clusterId))
      //     .range([lCom.clusterPlot.t, lCom.clusterPlot.h]);

      //   const xPdScale = d3
      //     .scaleLinear()
      //     .domain([0, 1])
      //     .range([0, lCom.pdpPlot.w]);

      //   const colorpdScale = d3
      //     .scaleLinear()
      //     .domain([0, 0.5, 1]) // 0 (prob of being con) --- >>> --- 1 (prob of being lib)
      //     .range([
      //       globalColors.group.con,
      //       'whitesmoke',
      //       globalColors.group.lib
      //     ]);

      //   const yPDPAxisSetting = d3.axisLeft(yClusterCoordpdScale).tickSize(0),
      //     yPDPAxis = gPDP
      //       .append('g')
      //       .call(yPDPAxisSetting)
      //       .attr('class', 'g_pdp_y_axis')
      //       .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

      //   const pdpBars = gPDP
      //     .selectAll('.cluster_circle')
      //     .data(
      //       clusters.map(d => {
      //         const clusterId = d.clusterId,
      //           tweetPDPValuesInCluster = tweets
      //             .filter(e => e.clusterId === clusterId)
      //             .map(f => f.prob);
      //         const avgPDPValuesForCluster = _.mean(tweetPDPValuesInCluster);

      //         return {
      //           clusterId: clusterId,
      //           avgPDPValue: avgPDPValuesForCluster
      //         };
      //       })
      //     )
      //     .enter()
      //     .append('rect')
      //     .attr(
      //       'class',
      //       (d, i) =>
      //         'cluster_output_prob_rect cluster_output_prob_rect_' + d.clusterId
      //     )
      //     .attr('x', 0)
      //     .attr('y', d => yClusterCoordpdScale(d.clusterId))
      //     .attr('width', d => xPdScale(d.avgPDPValue))
      //     .attr('height', yClusterCoordpdScale.bandwidth() - 3)
      //     .style('fill', d => colorpdScale(d.avgPDPValue))
      //     .style('opacity', 0.5);

      //   const pdpTitle = gPDP
      //     .append('text')
      //     .text('Output Prob')
      //     .attr('y', 10);
      // }

      function updateOnClickCluster(d, i) {
        const selectedCluster = d3.select(this),
          clusterId = d.clusterId;
        console.log('clicked cluster: ', clusterId);
        // When unselecting a selected cluster (going back to the whole)
        if (selectedCluster.classed('cluster_selected') === true) {
          d3.select(this)
            .classed('cluster_selected', false)
            .style('stroke', 'gray')
            .style('stroke-width', '1px');
          console.log('click already selected cluster: ', clusterId);

          // Return back all elements to the normal
          // gFeaturePlot.selectAll('.path_tweet').remove();
          d3.select('canvas').style('opacity', 1);
          d3.selectAll('.tweet_line').style('opacity', 0.3);

          // Update categorical lines
          const catLines = d3.select('.g_tweet_line_2').selectAll('.tweet_cat_line');
          catLines.style('stroke-width', d => d.lineHeight).style('stroke', d => groupRatioScale(d.groupRatio));

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

          // To put back the output prob plot
          const tweetsCorrectPredForCluster = tweetsCorrPred.filter(e => e.clusterId === clusterId);

          const dataBinCorrectPredTweets = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred);

          const dataBinWrongPredTweets = d3
            .histogram()
            .domain([0, 1])
            .value(d => d.prob)
            .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

          groups.forEach((group, groupIdx) => {
            const outputProbCorrRectsDataPerGroup = d3
                .selectAll('.rect_output_for_corr_' + group.abbr)
                .data(dataBinCorrPredTweetsForGroups[groupIdx]),
              outputProbWrongRectsDataPerGroup = d3
                .selectAll('.rect_output_for_wrong_' + group.abbr)
                .data(dataBinWrongPredTweetsForGroups[groupIdx]);

            outputProbCorrRectsDataPerGroup.exit().remove();
            outputProbWrongRectsDataPerGroup.exit().remove();

            outputProbCorrRectsDataPerGroup
              .attr('y', d => yOutputProbHistScale(d.x0))
              .attr('width', d => xOutputProbHistScale(d.length));
            outputProbWrongRectsDataPerGroup
              .attr('y', d => yOutputProbHistScale(d.x0))
              .attr('width', d => xOutputProbHistScale(d.length));
          });

          // To restore PDP for all
          // For cluster-specific PDPs
          d3.selectAll('.g_axis').each(function(feature, featureIdx) {
            var yAxisSetting;

            const drawPDPLine = d3
              .line()
              .x(e => feature.pdScale(e.pdpValue))
              .y(e => feature.scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            const drawPDPArea = d3
              .area()
              .x0(0)
              .x1(e => feature.pdScale(e.pdpValue))
              .y(e => feature.scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            const pdpValuesPerFeature = pdpValues.filter(e => e.feature === feature.key)[0].values;

            // For continuous variables
            if (feature.type === 'continuous') {
              const pdpPathForAll = d3.select('.path_pdp_' + feature.key).datum(pdpValuesPerFeature);
              const pdpAreaForAll = d3.select('.area_pdp_' + feature.key).datum(pdpValuesPerFeature);

              pdpPathForAll.exit().remove();
              pdpPathForAll.attr('d', drawPDPLine);
              pdpAreaForAll.exit().remove();
              pdpAreaForAll.attr('d', drawPDPArea);

              groups.forEach((group, groupIdx) => {
                const pdpValuesForGroup = pdpValuesForGroups[groupIdx].valuesForFeatures,
                  pdpValuesForGroupPerFeature = pdpValuesForGroup.filter(e => e.feature === feature.key)[0].values;
                const pdpPathForGroup = d3
                  .selectAll('.path_pdp_' + feature.key + '_for_' + group.abbr)
                  .datum(pdpValuesForGroupPerFeature);
                const pdpAreaForGroup = d3
                  .selectAll('.area_pdp_' + feature.key + '_for_' + group.abbr)
                  .datum(pdpValuesForGroupPerFeature);

                pdpPathForGroup.exit().remove();
                pdpPathForGroup.attr('d', drawPDPLine);
                pdpAreaForGroup.exit().remove();
                pdpAreaForGroup.attr('d', drawPDPArea);
              });
            } else if (feature.type === 'categorical') {
              const existingRects = d3.select('.g_feature_axis_' + feature.key).selectAll('.rect_pdp_' + feature.key);
              existingRects.remove();

              d3.select('.g_feature_axis_' + feature.key)
                .selectAll('.rect_pdp_' + feature.key)
                .data(pdpValuesPerFeature)
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp_' + feature.key)
                .attr('height', 10)
                .attr('width', e => feature.pdScale(e.pdpValue))
                .attr('x', 2)
                .attr('y', e => feature.scale(e.featureValue) + feature.scale.bandwidth() / 2 - 5)
                .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
                .style('fill', 'rgb(190, 255, 231)')
                .style('fill-opacity', 0.3);

              groups.forEach((group, groupIdx) => {
                const pdpValuesForGroup = pdpValuesForGroups[groupIdx].valuesForFeatures,
                  pdpValuesForGroupPerFeature = pdpValuesForGroup.filter(e => e.feature === feature.key)[0].values;
                const existingRectsForGroup = d3
                  .select('.g_feature_axis_' + feature.key)
                  .selectAll('.rect_pdp_' + feature.key + '_for_' + group.abbr);
                existingRectsForGroup.remove();

                d3.select('.g_feature_axis_' + feature.key)
                  .selectAll('.rect_pdp_' + feature.key + '_for_' + group.abbr)
                  .data(pdpValuesForGroupPerFeature)
                  .enter()
                  .append('rect')
                  .attr('class', 'rect_pdp_' + feature.key + '_for_' + group.abbr)
                  .attr('height', 5)
                  .attr('width', e => feature.pdScale(e.pdpValue))
                  .attr('x', 2)
                  .attr('y', (e, i) =>
                    groupIdx === 0
                      ? feature.scale(e.featureValue) + feature.scale.bandwidth() / 2 - 5
                      : feature.scale(e.featureValue) + feature.scale.bandwidth() / 2
                  )
                  .style('stroke', d3.rgb(globalColors.groups[groupIdx].color).darker())
                  .style('fill', globalColors.groups[groupIdx].color)
                  .style('fill-opacity', 0.3);
              });
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
          // When selecting a cluster
        } else {
          const clusterId = d.clusterId,
            tweetsInCluster = tweets.filter(e => e.clusterId === clusterId);

          console.log('unselected cluster is selected: ', clusterId);

          d3.selectAll('.cluster_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_selected', false);

          // Highlight selected cluster
          selectedCluster.attr('class', 'cluster_selected');
          selectedCluster.style('stroke-width', '3px').style('stroke', 'black');

          d3.selectAll('.cluster_output_prob_rect_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_output_prob_rect_selected', false);

          d3.selectAll('.line_feature_to_output').style('opacity', 0);

          d3.select('.cluster_output_prob_rect_' + clusterId)
            .style('stroke', 'black')
            .style('stroke-width', '2px')
            .classed('cluster_output_prob_rect_selected', true);

          d3.selectAll('.line_feature_to_output_' + clusterId).style('opacity', 0.3);

          // To highlight the paths for continous features
          // Highlight the cluster paths by generating svg paths
          const tweetsPathDataForCluster = tweetsInCluster.map(d => {
            const tweetWithSelectedFeatures = _.pick(d, features.map(({key}) => key));
            var tweetPathData = Object.entries(tweetWithSelectedFeatures);
            tweetPathData.group = d.group;

            return tweetPathData;
          });

          console.log('catTocatLine data: ', d3.selectAll('.tweet_cat_line').data());

          d3.selectAll('.g_tweet_line').each(function(feature, featureIdx) {
            if (featureIdx !== features.length - 1) {
              const gFeatureSelected = d3.select(this);
              const tweetIdsInCluster = tweetsInCluster.map(d => d.tweetId);

              if (feature.type === 'continuous') {
                gFeatureSelected.selectAll('.tweet_line').style('opacity', 0);

                const tweetLinesForCluster = gFeatureSelected
                  .selectAll('.tweet_line')
                  .filter(d => _.includes(tweetIdsInCluster, d.tweetId));

                tweetLinesForCluster.exit().remove();
                tweetLinesForCluster.style('opacity', 0.5);
              } else if (feature.type === 'categorical') {
                // To updated aggregated paths for categorical features
                const dataCatToCat = d3
                  .select('.g_tweet_line_2')
                  .selectAll('.tweet_cat_line')
                  .data();

                const dataCatToCatForCluster = dataCatToCat.map(d => {
                  const tweetsInCurr = d.tweetsInCurr;
                  const tweetsInCatToCat = d.tweetsInCatToCat;
                  const tweetsCatToCatForCl = tweetsInCatToCat.filter(t => t.clusterId === clusterId);
                  const libRatio = tweetsCatToCatForCl.filter(d => d.group === '1').length / tweetsCatToCatForCl.length;
                  let numTweetsRatioInCurr = 0;
                  if (tweetsCatToCatForCl.length !== 0) numTweetsRatioInCurr = tweetsCatToCatForCl.length / tweetsInCurr.length;

                  return {
                    ...d,
                    lineHeightForCl: d.heightForCat * numTweetsRatioInCurr,
                    groupRatioForCl: libRatio
                  };
                });
                console.log('current cluster: ', clusterId);
                console.log('dataCatToCatForCluster: ', dataCatToCatForCluster);
                const catLines = d3
                  .select('.g_tweet_line_2')
                  .selectAll('.tweet_cat_line')
                  .data(dataCatToCatForCluster);
                catLines.style('stroke-width', d => d.lineHeightForCl).style('stroke', d => groupRatioScale(d.groupRatioForCl));
              }
            }
          });
          // d3.select('.g_feature_pl!ot')
          //   .selectAll('.path_tweet_for_cluster')
          //   .data(tweetsPathDataForCluster)
          //   .enter()
          //   .append('path')
          //   .attr('class', 'path_tweet_for_cluster')
          //   .attr('d', drawTweetLine)
          //   .style('stroke', d => groupColorScale(d.group))
          //   .style('fill', 'none')
          //   .style('stroke-width', 0.3)
          //   .style('opacity', 0.3);

          // d3.select('canvas').style('opacity', 0.1);

          // To adjust the output prob plot
          const tweetsCorrPredForCluster = tweetsCorrPred.filter(e => e.clusterId === clusterId);
          const tweetsWrongPredForCluster = tweetsWrongPred.filter(e => e.clusterId === clusterId);

          let dataBinWrongTweetsForGroupsPerCl = [];
          let dataBinCorrTweetsForGroupsPerCl = [];

          // Prepare data
          groups.forEach((group, groupIdx) => {
            const tweetsCorrPred = tweetsCorrPredForCluster.filter(d => d.group === d.pred && d.group === groupIdx.toString()),
              tweetsWrongPred = tweetsWrongPredForCluster.filter(d => d.group !== d.pred && d.group === groupIdx.toString()),
              dataBinCorrPredTweets = d3
                .histogram()
                .domain([0, 1])
                .value(d => d.prob)
                .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred),
              dataBinWrongPredTweets = d3
                .histogram()
                .domain([0, 1])
                .value(d => d.prob)
                .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

            const maxFreqWrong = _.max(dataBinWrongPredTweets.map(d => d.length));

            dataBinCorrTweetsForGroupsPerCl.push(dataBinCorrPredTweets);
            dataBinWrongTweetsForGroupsPerCl.push(dataBinWrongPredTweets);
          });

          groups.forEach((group, groupIdx) => {
            const outputProbCorrRectsPerGroup = d3
                .selectAll('.rect_output_for_corr_' + group.abbr)
                .data(dataBinCorrTweetsForGroupsPerCl[groupIdx]),
              outputProbWrongRectsPerGroup = d3
                .selectAll('.rect_output_for_wrong_' + group.abbr)
                .data(dataBinWrongTweetsForGroupsPerCl[groupIdx]);

            outputProbCorrRectsPerGroup.exit().remove();
            outputProbWrongRectsPerGroup.exit().remove();

            outputProbCorrRectsPerGroup
              .attr('y', d => yOutputProbHistScale(d.x0))
              .attr('width', d => xOutputProbHistScale(d.length));
            outputProbWrongRectsPerGroup
              .attr('y', d => yOutputProbHistScale(d.x0))
              .attr('width', d => xOutputProbHistScale(d.length));
          });

          // For cluster-specific PDPs
          d3.selectAll('.g_axis').each(function(feature, featureIdx) {
            var yAxisSetting;

            const drawPDPLine = d3
              .line()
              .x(e => features[featureIdx].pdScale(e.pdpValue))
              .y(e => features[featureIdx].scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            const drawPDPArea = d3
              .area()
              .x0(0)
              .x1(e => features[featureIdx].pdScale(e.pdpValue))
              .y(e => features[featureIdx].scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            // For continuous variables
            if (feature.type === 'continuous') {
              const pdpPathForAll = d3
                .select('.path_pdp_' + feature.key)
                .datum(pdpValuesForCls[clusterId].valuesForFeatures[featureIdx].values);
              const pdpAreaForAll = d3
                .select('.area_pdp_' + feature.key)
                .datum(pdpValuesForCls[clusterId].valuesForFeatures[featureIdx].values);

              pdpPathForAll.exit().remove();
              pdpPathForAll.attr('d', drawPDPLine);
              pdpAreaForAll.exit().remove();
              pdpAreaForAll.attr('d', drawPDPArea);

              groups.forEach((group, groupIdx) => {
                // For continuous variables
                const pdpPathForClGroup = pdpValuesForClsGroups.filter(e => e.cluster === clusterId);
                const pdpPathForGroup = d3
                  .select('.path_pdp_' + feature.key + '_for_' + group.abbr)
                  .datum(pdpPathForClGroup[groupIdx].valuesForFeatures[featureIdx].values);

                const pdpAreaForGroup = d3
                  .select('.area_pdp_' + feature.key + '_for_' + group.abbr)
                  .datum(pdpPathForClGroup[groupIdx].valuesForFeatures[featureIdx].values);

                pdpPathForGroup.attr('d', drawPDPLine);
                pdpAreaForGroup.attr('d', drawPDPArea);
              });
            } else if (feature.type === 'categorical') {
              const pdpRectsForAll = d3
                .selectAll('.rect_pdp_' + feature.key)
                .data(pdpValuesForCls[clusterId].valuesForFeatures[featureIdx].values);

              pdpRectsForAll
                .attr('width', e => feature.pdScale(e.pdpValue))
                .attr('x', 2)
                .attr('y', e => feature.scale(e.featureValue) + feature.scale.bandwidth() / 2 - 5);
              pdpRectsForAll.exit().remove();

              groups.forEach((group, groupIdx) => {
                const pdpPathForClGroup = pdpValuesForClsGroups.filter(e => e.cluster === clusterId);
                const pdpRectsForGroup = d3
                  .selectAll('.rect_pdp_' + feature.key + '_for_' + group.abbr)
                  .data(pdpPathForClGroup[groupIdx].valuesForFeatures[featureIdx].values);

                pdpRectsForGroup
                  .attr('width', e => feature.pdScale(e.pdpValue))
                  .attr('x', 2)
                  .attr('y', (e, i) =>
                    groupIdx === 0
                      ? feature.scale(e.featureValue) + feature.scale.bandwidth() / 2 - 5
                      : feature.scale(e.featureValue) + feature.scale.bandwidth() / 2
                  );
                pdpRectsForGroup.exit().remove();
              });
            }
          });

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
        } // end of else click
      }
    }, [tweets, clusters, words, features, isLoaded, pdpValues, ref.current]);

    d3.selectAll('canvas').remove();
    d3.selectAll('canvas').remove();

    return (
      <div>
        <SubsectionTitle
          style={{
            marginLeft: '10px',
            fontSize: '1.1rem'
          }}
        >
          H-Plot
        </SubsectionTitle>
        <FeaturePlotViewWrapper
          ref={ref}
          // width={wholeWidth}
          // height={wholeHeight}
          style={{display: 'flex'}}
        >
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              width: '80px'
            }}
          >
            <Indicator
              style={{
                width: lCom.hIndicator.w,
                height: ll.l1.h,
                lineHeight: ll.l1.h + 'px'
              }}
            >
              Goal
            </Indicator>
            <EmptyIndicator
              style={{
                width: lCom.hIndicator.w,
                height: ll.l1ToL2.h
              }}
            ></EmptyIndicator>
            <Indicator
              style={{
                width: lCom.hIndicator.w,
                height: ll.l2.h,
                lineHeight: ll.l2.h + 'px'
              }}
            >
              Coarse
            </Indicator>
            <EmptyIndicator
              style={{
                width: lCom.hIndicator.w,
                height: ll.l2ToL3.h,
                lineHeight: ll.l2ToL3.h + 'px'
              }}
            ></EmptyIndicator>
            <Indicator
              style={{
                width: lCom.hIndicator.w,
                height: ll.l3.h,
                lineHeight: ll.l3.h + 'px'
              }}
            >
              Fine
            </Indicator>
          </div>
          <div>
            <svg width={l.w} height={l.h} viewBox={'0 0 ' + l.w + ' ' + l.h} preserveAspectRatio="xMinYMin" ref={ref2} />
            <SeqPlotView
              globalMode={globalMode}
              wordsInTweets={tweets}
              features={features}
              isClusterSelected={isClusterSelected}
              tweetsInClusterForSeqPlot={tweetsInClusterForSeqPlot}
            />
          </div>
        </FeaturePlotViewWrapper>
      </div>
    );
  }
);

export default FeaturePlotView;

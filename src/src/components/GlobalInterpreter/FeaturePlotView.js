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

import {fetchSeqs} from '../../modules/tweet';

import { Radio } from 'antd';

import {renderQueue} from '../../lib/renderQueue';

import SeqPlotView from './SeqPlotView';
import SeqPlotView2 from './SeqPlotView2';

import Level1Plot from './Level1Plot';
import Level2Plot from './Level2Plot';
import Level3Plot from './Level3Plot';
import ClusterPlot from './ClusterPlot';
import ClusterPlotBefore from './ClusterPlotBefore';

const FeaturePlotViewWrapper = styled.div.attrs({
  className: 'feature_plot_view_wrapper'
})`
  height: 100%;
  background-color: white;
  margin: 5px;
  padding: 5px;
  // border: 0.5px solid lightgray;
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
    clusterIdsForTweets,
    clustersForGoals,
    words,
    seqs,
    groups,
    features,
    isLoaded,
    pdpValues,
    pdpValuesForGroups,
    pdpValuesForCls,
    pdpValuesForClsGroups,
    currentModelInfo,
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
        svg = d3.select(ref2.current);

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

      //* Scales
      const xFeatureScale = d3
        .scalePoint()
        .domain(features.map(({key}) => key))
        .range([0, lCom.hPlot.w]);

      features.forEach(feature => {
        const featureScale = feature.scale,
          pdScale = feature.pdScale;

        if (feature.type == 'continuous') {
          featureScale
            .domain(feature.domain)
            .range([lCom.hPlot.featurePlot.h, 0]);

          pdScale
            .domain([0, 1])
            .range([0, lCom.hPlot.featurePlot.pdp.w]);
        } else if (feature.type == 'categorical') {
          const height = lCom.hPlot.featurePlot.h,
            topMargin = layout.margin.top,
            numCategory = feature.values.length;
          // rangeList = d3.range(numCategory).map(
          //   idx => height - (height / (numCategory - 1)) * idx // e.g., 100 - (100/3) * 1 - when there are 4 categories
          // );

          featureScale
            .domain(feature.domain)
            .range([height, 0]);

          pdScale
            .domain([0, 1])
            .range([0, lCom.hPlot.featurePlot.pdp.w]);
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
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
        .range(['#CB4335', '#E74C3C', '#FADBD8', '#D7DBFF', '#7584FF', '#001BFF']);

      // For level 1
      const xGoalScale = d3
        .scaleBand()
        .domain(features.map(d => d.key))
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
            clusters,
            clusterIdsForTweets,
            pdpValues,
            pdpValuesForGroups,
            // dataBinCorrPredTweets,
            // dataBinCorrPredTweetsForGroups,
            // dataBinWrongPredTweetsForGroups,
            tweetsCorrPred,
            tweetsConWrongPred,
            tweetsLibWrongPred,
            currentModelInfo
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
        prob: d.prob,
        clusterId: d.clusterId,
        tweetId: d.tweetId,
        tweetIdx: d.tweetIdx,
        source: {
          x: xFeatureToOutputScale(0),
          y: lastFeature === 'continuous' 
              ? lastFeature.scale(d[lastFeature.key]) 
              : lastFeature.scale(d[lastFeature.key]) + lastFeature.scale.bandwidth() / 2
        },
        target: {
          x: xFeatureToOutputScale(1),
          y: yOutputProbScale(d.prob)
        }
      }));

      const featureToOutputLinesData = gFeatureToOutputLines
        .selectAll('.line_feature_to_output')
        .data(dataFeatureToOutputLines);

      // prettier-ignore
      featureToOutputLinesData
        .enter()
        .append('path')
        .attr('class', d => 'line_feature_to_output line_feature_to_output_' + d.tweetIdx 
          + ' line_feature_to_output_cl_' + d.clusterId)
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

      // Add and store a brush for each axis.
      d3.selectAll('.g_axis')
        .append('g')
        .attr('class', 'brush')
        .each(function(d) {
          d3.select(this).call(
            (d.brush = d3
              .brushY()
              .extent([[-10, 0], [10, l.h]])
              .on('brush', brush)
              .on('end', brushended))
          );
        })
        .selectAll('rect')
        .attr('x', 0)
        .attr('width', 8)
        .on('click', function(d){
          console.log('click in');
          d3.selectAll('.tweet_line')
            .style('opacity', 0);

          d3.selectAll('tweet_cat_line')
            .style('stroke-width', (d) => d.lineHeight);

          d3.select('mean_prob_text').remove();
        });

      function brush() {
        const actives = [];
        svg
          .selectAll('.g_axis .brush')
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
          const selectedFeature = features.filter(d => d.key == dim)[0];
          return (
            extent[0] <= selectedFeature.scale(value) &&
            selectedFeature.scale(value) <= extent[1]
          );
        }

        const allContLines = d3.selectAll('.tweet_line');
        const allCatLines = d3.selectAll('.tweet_cat_line');
        const allLinesToOutput = d3.selectAll('.line_feature_to_output');
        const filteredTweetIds = tweets
          .filter(function(d) {
            let dim = '';
            if (
              actives.every(function(active) {
                console.log(active.extent)
                dim = active.dimension;
                
                return within(d[dim.key], active.extent, dim.key);
              })
            ) {
              return true;
            }
          }).map(e => e.tweetId);
        const filteredLines = allContLines.filter(e => 
            { return _.includes(filteredTweetIds, e.tweetId) });
        const filteredOutputLines = allLinesToOutput.filter(e => {
            return _.includes(filteredTweetIds, e.tweetId)
          });

        allCatLines.each(function(d, i) {
          const catLine = d3.select(this);
          // Adjust the stroke width of cat lines to the ratio of (existing tweets in filtered tweets) / (all tweets in cat line)
          const numCatLineTweetsInAllTweets = d.tweetsInCatToCat.length;
          const numCatLineTweetsInFilteredTweets = d.tweetsInCatToCat.filter(d => _.includes(filteredTweetIds, d.tweetId)).length;
          const selectedTweetRatio = numCatLineTweetsInFilteredTweets / numCatLineTweetsInAllTweets;
          console.log('selectedTweetRatio: ', selectedTweetRatio);
          const catLineWidth = d.lineHeight;
          const LineWidthForSelectedTweets = catLineWidth * selectedTweetRatio;
          console.log('LineWidthForSelectedTweets: ', catLineWidth, selectedTweetRatio, LineWidthForSelectedTweets);
          catLine
            .style('stroke-width', LineWidthForSelectedTweets);
        });
        console.log('filteredOutputLines: ', filteredOutputLines);
        allContLines.style('opacity', 0);
        allLinesToOutput.style('opacity', 0);

        filteredLines.style('opacity', 0.3);
        filteredOutputLines.style('opacity', 0.3);

        let avgProbForFilteredTweets = 0;
        if (filteredOutputLines.length !== 0)
          avgProbForFilteredTweets = _.mean(filteredOutputLines.data().map(d => d.prob));
        
        if (d3.select('.g_output_prob_plot').select('.mean_prob_text').empty()) {
          d3.select('.g_output_prob_plot')
            .append('text')
            .attr('class', 'mean_prob_text')
            .text('mean-prob: ' + Math.ceil(avgProbForFilteredTweets * 100) / 100);
        } else {
          d3.select('.g_output_prob_plot')
            .select('.mean_prob_text')
            .text('mean-prob: ' + Math.ceil(avgProbForFilteredTweets * 100) / 100);
        }
        

        // For cat-to-cat lines
        d3.selectAll('.tweet_cat_line').data().filter(d => d.tweetsInCatToCat)
        
        console.log('filtered tweet lines: ', filteredLines);
      }

      function brushended() {
        // if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) {
          console.log('click in');
          d3.selectAll('.tweet_line')
            .style('opacity', 0.3);

          d3.selectAll('.tweet_cat_line')
            .style('stroke-width', (d) => d.lineHeight);

          d3.selectAll('.mean_prob_text').remove();
        }
      }

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
          'translate(' + (lCom.clusterPlot.l + lCom.clusterPlot.maxR * 2 + 40) + ',' + (lCom.clusterPlot.maxR * 2 + 50) + ')'
        );

      // for ClusterPlotBefore
      const yClusterCoordScale = d3
        .scaleBand()
        .domain(clusters.map(d => d.clusterId))
        .range([0, lCom.clusterPlot.h]);

      gClusterPlot.call(
        clusterPlot
          .dataLoader([features, clusters, groups, tweets, clusterIdsForTweets])
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
        // When unselecting a selected cluster (going back to the whole)
        if (selectedCluster.classed('cluster_selected') === true) {
          d3.select(this)
            .classed('cluster_selected', false)
            .style('stroke', 'gray')
            .style('stroke-width', '1px');

          d3.selectAll('.point_to_subgroup_for_selected_instance.subgroup_' + clusterId)
            .style('opacity', 1);

          // Return back all elements to the normal
          // gFeaturePlot.selectAll('.path_tweet').remove();
          d3.select('canvas').style('opacity', 1);
          d3.selectAll('.tweet_line').style('opacity', 0.3);

          // Update categorical lines
          const catLines = d3.select('.g_tweet_line_2')
            .selectAll('.tweet_cat_line');

          catLines
            .style('stroke-width', d => d.lineHeight)
            .style('stroke', d => groupRatioScale(d.groupRatio));

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
                .attr('class', 'rect_pdp rect_pdp_' + feature.key)
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
                  .attr('class', 'rect_pdp rect_pdp_' + feature.key + '_for_' + group.abbr)
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

          d3.selectAll('.cluster_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_selected', false);

          // Highlight selected cluster
          selectedCluster
            .attr('class', 'cluster_selected')
            .style('stroke-width', '3px')
            .style('stroke', 'black');

          d3.selectAll('.cluster_output_prob_rect_selected')
            .style('stroke', 'gray')
            .style('stroke-width', '1px')
            .classed('cluster_output_prob_rect_selected', false);

          d3.selectAll('.line_feature_to_output')
            .style('opacity', 0);

          d3.select('.cluster_output_prob_rect_' + clusterId)
            .style('stroke', 'black')
            .style('stroke-width', '2px')
            .classed('cluster_output_prob_rect_selected', true);

          d3.selectAll('.line_feature_to_output_' + clusterId)
            .style('opacity', 0.3);

          // To highlight the paths for continous features
          // Highlight the cluster paths by generating svg paths
          const tweetsPathDataForCluster = tweetsInCluster.map(d => {
            const tweetWithSelectedFeatures = _.pick(d, features.map(({key}) => key));
            var tweetPathData = Object.entries(tweetWithSelectedFeatures);
            tweetPathData.group = d.group;

            return tweetPathData;
          });

          d3.selectAll('.g_tweet_line').each(function(feature, featureIdx) {
            if (featureIdx !== features.length - 1) {
              const gFeatureSelected = d3.select(this);
              const tweetIdsInCluster = tweetsInCluster.map(d => d.tweetId);

              if (feature.type === 'continuous') {
                gFeatureSelected
                  .selectAll('.tweet_line')
                  .style('opacity', 0);

                const tweetLinesForCluster = gFeatureSelected
                  .selectAll('.tweet_line')
                  .filter(d => _.includes(tweetIdsInCluster, d.tweetId));

                tweetLinesForCluster.exit().remove();
                tweetLinesForCluster.style('opacity', 0.7);
              } else if (feature.type === 'categorical') {
                // To updated aggregated paths for categorical features
                const catLines = d3
                  .select('.g_feature_plot')
                  .selectAll('.tweet_cat_line');
                const dataCatToCat = catLines.data();

                const dataCatToCatForCluster = dataCatToCat.map(d => {
                  const tweetsInCurr = d.tweetsInCurr;
                  const tweetsInCatToCat = d.tweetsInCatToCat;
                  const tweetsCatToCatForCl = tweetsInCatToCat.filter(t => t.clusterId === clusterId);
                  const libRatio = tweetsCatToCatForCl.filter(d => d.group === '1').length / tweetsCatToCatForCl.length;
                  let numTweetsRatioInCurr = 0;

                  if (tweetsCatToCatForCl.length !== 0) 
                    numTweetsRatioInCurr = tweetsCatToCatForCl.length / tweetsInCurr.length;

                  return {
                    ...d,
                    lineHeightForCl: d.heightForCat * numTweetsRatioInCurr,
                    groupRatioForCl: libRatio
                  };
                });
                
                catLines.data(dataCatToCatForCluster);
                catLines
                  .style('stroke-width', d => d.lineHeightForCl)
                  .style('stroke', d => groupRatioScale(d.groupRatioForCl));
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

          //* For the current version
          // groups.forEach((group, groupIdx) => {
          //   const outputProbCorrRectsPerGroup = d3
          //       .selectAll('.rect_output_for_corr_' + group.abbr)
          //       .data(dataBinCorrTweetsForGroupsPerCl[groupIdx]),
          //     outputProbWrongRectsPerGroup = d3
          //       .selectAll('.rect_output_for_wrong_' + group.abbr)
          //       .data(dataBinWrongTweetsForGroupsPerCl[groupIdx]);

          //   outputProbCorrRectsPerGroup.exit().remove();
          //   outputProbWrongRectsPerGroup.exit().remove();

          //   outputProbCorrRectsPerGroup
          //     .attr('y', d => yOutputProbHistScale(d.x0))
          //     .attr('width', d => xOutputProbHistScale(d.length));
          //   outputProbWrongRectsPerGroup
          //     .attr('y', d => yOutputProbHistScale(d.x0))
          //     .attr('width', d => xOutputProbHistScale(d.length));
          // });

          const tweetsCorrectPredForCluster = tweetsCorrPred.filter(
            e => e.clusterId === clusterId
          );
          const tweetsConWrongPredForCluster = tweetsWrongPred.filter(
            e => (e.clusterId === clusterId && e.group === '0')
          );
          const tweetsLibWrongPredForCluster = tweetsWrongPred.filter(
            e => (e.clusterId === clusterId && e.group === '1')
          );

          const dataBinCorrPredTweets = d3
                  .histogram()
                  .domain([0, 1])
                  .value(d => d.prob)
                  .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred),
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

          const dataBinCorrPredTweetsForCluster = d3
                  .histogram()
                  .domain([0, 1])
                  .value(d => d.prob)
                  .thresholds(d3.range(0, 1, 0.05))(tweetsCorrectPredForCluster),
                dataBinConWrongPredTweetsForCluster = d3
                  .histogram()
                  .domain([0, 1])
                  .value(d => d.prob)
                  .thresholds(d3.range(0, 1, 0.05))(tweetsConWrongPredForCluster),
                dataBinLibWrongPredTweetsForCluster = d3
                  .histogram()
                  .domain([0, 1])
                  .value(d => d.prob)
                  .thresholds(d3.range(0, 1, 0.05))(tweetsLibWrongPredForCluster);


          const maxFreq = _.max(dataBinCorrPredTweets.map(d => d.length)),
            maxFreqConWrong = _.max(dataBinConWrongPredTweets.map(d => d.length)),
            maxFreqLibWrong = _.max(dataBinLibWrongPredTweets.map(d => d.length));

          const xOutputProbWrongHistScale = d3
            .scaleLinear()
            .domain([0, _.max([maxFreqConWrong, maxFreqLibWrong])])
            .range([0, lCom.outputProbPlot.w / 2]);

          const yOutputProbHistBinScale = d3
            .scaleBand()
            .domain(dataBinCorrPredTweetsForCluster.map(d => d.x0).reverse()) // From 1 to 0
            .range([l.sm, lCom.outputProbPlot.h]);

          // tweetHistForCorrectPred
          const outputProbForCorrPred = d3.select('.g_output_prob_hist_for_correct_pred')
            .selectAll('.rect_output_prob_hist_for_correct_pred')
            .data(dataBinCorrPredTweetsForCluster);

          outputProbForCorrPred.exit().remove();

          outputProbForCorrPred
            .attr('y', d => yOutputProbHistBinScale(d.x0))
            .attr('width', d => xOutputProbHistScale(d.length));

          // tweetLibHistForWrongPred
          const outputProbForLibWrongPred = d3.select('.g_output_prob_hist_for_lib_wrong_pred')
            .selectAll('.rect_output_prob_hist_for_lib_wrong_pred')
            .data(dataBinLibWrongPredTweetsForCluster);

            outputProbForLibWrongPred.exit().remove();

            outputProbForLibWrongPred
              .attr(
                'x',
                d =>
                  layout.outputProbPlot.width / 2 -
                  xOutputProbWrongHistScale(d.length)
              )
              .attr('width', d => xOutputProbWrongHistScale(d.length));

          // tweetConHistForWrongPred
          const outputProbForConWrongPred = d3.select('.g_output_prob_hist_for_con_wrong_pred')
            .selectAll('.rect_output_prob_hist_for_con_wrong_pred')
            .data(dataBinConWrongPredTweetsForCluster);

            outputProbForConWrongPred.exit().remove();

            outputProbForConWrongPred
                .attr(
                  'x',
                  d =>
                    layout.outputProbPlot.width / 2 -
                    xOutputProbWrongHistScale(d.length)
                )
                .attr('width', d => xOutputProbWrongHistScale(d.length));

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

          dispatch(
            fetchSeqs({
              opt: 'dynamic',
              mode: 'cluster',
              // tweetIds: tweetsInCluster.map(d => d.tweetIdx)
              tweetIds: [1,2,4,5,10,20,25,30,35,62,100,400,284,800,1000,1023,3040],
              seqWeights: {
                post: 1,
                ranking: 1,
                length: 1,
                freq: 1
              }
            })
          );

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
      <div
        style={{ gridArea: 'fp'}}>
        <SubsectionTitle
          style={{
            marginLeft: '10px',
            fontSize: '1.1rem',
            marginTop: '30px'
          }}
        >
          Group-level comparison
        </SubsectionTitle>
        <div style={{ marginLeft: '10px'}}>
          <Radio.Group 
            onChange={e => {
              if (e.target.value == 'pdp') {
                d3.selectAll('.subgroup_rect').style('opacity', 0);
                d3.selectAll('.path_pdp').style('opacity', '');
                d3.selectAll('.area_pdp').style('opacity', '');
                d3.selectAll('.rect_pdp').style('opacity', '');
              } else if (e.target.value == 'subgroup') {
                d3.selectAll('.subgroup_rect')
                  .style('opacity', '')
                  .raise();
                d3.selectAll('.path_pdp').style('opacity', 0);
                d3.selectAll('.area_pdp').style('opacity', 0);
                d3.selectAll('.rect_pdp').style('opacity', 0);
              }
            }}
            defaultValue="pdp" 
            buttonStyle="solid"
          >
            <Radio.Button value="subgroup">Subgroup</Radio.Button>
            <Radio.Button value="pdp">PDP</Radio.Button>
          </Radio.Group>
        </div>
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
          <div style={{ 'overflow-x': 'scroll' }}>
            <svg 
              width={l.w} 
              height={l.h} 
              viewBox={'0 0 ' + l.w + ' ' + l.h} 
              preserveAspectRatio="xMinYMin" 
              ref={ref2}
            />
            <SeqPlotView2
              globalMode={globalMode}
              wordsInTweets={tweets}
              features={features}
              seqs={seqs}
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

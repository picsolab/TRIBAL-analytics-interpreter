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
  l,
  ll,
  lCom,
  SectionWrapper,
  SectionTitle,
  SubsectionTitle,
  SubTitle
} from '../../GlobalStyles';
import { globalScales } from '../../GlobalScales';

import { renderQueue } from '../../lib/renderQueue';

import Level1Plot from './Level1Plot';
import Level2Plot from './Level2Plot';
import Level3Plot from './Level3Plot';
import ClusterPlot from './ClusterPlot';

const FeaturePlotViewWrapper = styled.div.attrs({
  className: 'feature_plot_view_wrapper'
})`
  grid-area: f;
  height: 80%;
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
  margin: { top: 30, right: 110, bottom: 20, left: 30 },
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
    cooc
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
        .attr(
          'transform',
          'translate(' + lCom.hPlot.l + ',' + lCom.hPlot.t + ')'
        );

      const gLevel1 = gHPlot
          .append('g')
          .attr('class', 'g_level1')
          .attr('transform', 'translate(' + 0 + ',' + ll.l1.t + ')'),
        gLevel2 = gHPlot
          .append('g')
          .attr('class', 'g_level2')
          .attr('transform', 'translate(' + 0 + ',' + ll.l2.t + ')'),
        gLevel3 = gHPlot
          .append('g')
          .attr('class', 'g_level3')
          .attr('transform', 'translate(' + 0 + ',' + ll.l3.t + ')');

      const goalPlot = Level1Plot();
      const featurePlot = Level2Plot();
      const wordPlot = Level3Plot();

      //* Data
      // prettier-ignore
      const tweetsCorrectPred = tweets.filter(d => d.group === d.pred),
        tweetsWrongPred = tweets.filter(d => (d.group !== d.pred)),
        tweetsConWrongPred = tweets.filter(d => (d.group !== d.pred) && (d.group === '0')),
        tweetsLibWrongPred = tweets.filter(d => (d.group !== d.pred) && (d.group === '1'));

      // Settings for outputProbPlot
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

      //* Scales
      const xFeatureScale = d3
        .scalePoint()
        .domain(features.map(({ key }) => key))
        .range([0, lCom.hPlot.w]);

      features.forEach(feature => {
        const featureScale = feature.scale,
          pdScale = feature.pdScale;

        if (feature.type == 'continuous') {
          featureScale
            .domain(feature.domain)
            .range([lCom.hPlot.featurePlot.h, 0]);
          pdScale
            .domain(feature.domain)
            .range([0, lCom.hPlot.featurePlot.pdp.w]);
        } else if (feature.type == 'categorical') {
          const height = lCom.hPlot.featurePlot.h,
            topMargin = layout.margin.top,
            numCategory = feature.values.length,
            rangeList = d3.range(numCategory).map(
              idx => height - (height / (numCategory - 1)) * idx // e.g., 100 - (100/3) * 1 - when there are 4 categories
            );

          featureScale.domain(feature.domain).range(rangeList);
          pdScale
            .domain(feature.domain)
            .range([0, lCom.hPlot.featurePlot.pdp.w]);
        }
      });

      const groupColorScale = d3
        .scaleOrdinal()
        .domain([1, 0])
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

      // For level 1 -> 2
      //let xHorizontalScaleForFeature;

      // For level 2
      const xOutputProbCorrectHistScale = d3
        .scaleLinear()
        .domain([0, maxFreq])
        .range([0, lCom.outputProbPlot.w / 2]);

      const xOutputProbWrongHistScale = d3
        .scaleLinear()
        .domain([0, _.max([maxFreqConWrong, maxFreqLibWrong])])
        .range([0, lCom.outputProbPlot.w / 2]);

      const yOutputProbScale = d3
        .scaleLinear()
        .domain([1, 0])
        .range([0, lCom.outputProbPlot.h / 2 - 30]);

      const yGroupScale = d3 // Vertical position of outputProbPlot per group
        .scaleBand()
        .domain([0, 1])
        .range([0, lCom.outputProbPlot.h]);

      const yOutputProbHistBinScale = d3
        .scaleBand()
        .domain(dataBinCorrectPredTweets.map(d => d.x0).reverse()) // From 1 to 0
        .range([0, lCom.outputProbPlot.h / 2 - 30]);

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
            dataBinCorrectPredTweets,
            dataBinConWrongPredTweets,
            dataBinLibWrongPredTweets
          ])
          .xFeatureScale(xFeatureScale)
          .xOutputProbCorrectHistScale(xOutputProbCorrectHistScale)
          .xOutputProbWrongHistScale(xOutputProbWrongHistScale)
          .yOutputProbScale(yOutputProbScale)
          .yGroupScale(yGroupScale)
          .yOutputProbHistBinScale(yOutputProbHistBinScale)
          .groupColorScale(groupColorScale)
      );

      gLevel1.call(
        goalPlot
          .dataForGoals(goals)
          .dataForClusterForGoals(clustersForGoals)
          .xGoalScale(xGoalScale)
          .xClusterPerGoalScale(xClusterPerGoalScale)
      );

      gLevel3.call(
        wordPlot
          .dataForWords(words)
          .dataForCooc(cooc)
          .xWordScale(xWordScale)
          .coocThreshold(0.2)
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

      const featureToOutputLinesData = gFeatureToOutputLines
        .selectAll('.line_feature_to_output')
        .data(tweets);

      // prettier-ignore
      featureToOutputLinesData
        .enter()
        .append('line')
        .attr('class', d => 'line_feature_to_output line_feature_to_output_' + d.clusterId)
        .attr('x1', xFeatureToOutputScale(0))
        .attr('y1', d => {
          const lastFeature = features[features.length - 1];
          return lastFeature.scale(d[lastFeature.key])
        })
        .attr('x2', d => xFeatureToOutputScale(1))
        .attr('y2', d => yOutputProbScale(d.prob))
        .style('stroke', d =>
          d.group === d.pred
            ? groupColorScale(d.group)
            : groupWrongColorScale(d.group)
        )
        .style('stroke-width', 0.3)
        .style('opacity', d => 0.3);

      featureToOutputLinesData
        .attr('x1', xFeatureToOutputScale(0))
        .attr('y1', d => {
          const lastFeature = features[features.length - 1];
          return lastFeature.scale(d[lastFeature]);
        })
        .attr('x2', d => xFeatureToOutputScale(1))
        .attr('y2', d => yOutputProbScale(d.prob));

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
      const clusterPlot = ClusterPlot();
      const gClusterPlot = svg
        .append('g')
        .attr('class', 'g_cluster_plot')
        .attr(
          'transform',
          'translate(' +
            (lCom.clusterPlot.l + lCom.clusterPlot.maxR * 2) +
            ',' +
            lCom.clusterPlot.maxR * 2 +
            ')'
        )
        .call(clusterPlot);

      const xClusterCoordScale = d3
        .scaleBand()
        .domain(clusters.map(d => d.clusterId))
        .range([0, lCom.clusterPlot.w]);

      const numTweetClusterScale = d3
        .scaleLinear()
        .domain(d3.extent(clusters.map(d => d.numTweets)))
        .range([lCom.clusterPlot.minR, lCom.clusterPlot.maxR]);

      const xClusterAxisSetting = d3
          .axisTop(xClusterCoordScale)
          .tickValues([])
          .tickSize(0),
        xClusterAxis = gClusterPlot
          .append('g')
          .call(xClusterAxisSetting)
          .attr('class', 'g_cluster_x_axis')
          .attr(
            'transform',
            'translate(' + 0 + ',' + lCom.clusterPlot.maxR * 2 + ')'
          );

      const drawTweetLine = d3
        .line()
        .x(d => xFeatureScale(d[0]))
        .y((d, i) => features[d[0]].scale(d[1]));

      // prettier-ignore
      // const clusterCircles = gClusterPlot
      //   .selectAll('.cluster_circle')
      //   .data(clusters)
      //   .enter()
      //   .append('circle')
      //   .attr('class', (d, i) => 'cluster_circle cluster_circle_' + i)
      //   .attr('cx', d => xClusterCoordScale(d.clusterId) + xClusterCoordScale.bandwidth()/2)
      //   .attr('cy', d => 0)
      //   .attr('r', d => numTweetClusterScale(d.numTweets))
      //   .style('fill', d => groupRatioScale(d.groupRatio.lib))
      //   .style('fill-opacity', 0.5)
      //   .style('stroke', d => d3.rgb(groupRatioScale(d.groupRatio.lib)).darker())
      //   .on('mouseover', function(d) {
      //       d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).darker());
      //   })
      //   .on('mouseout', function(d) {
      //       d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).brighter());
      //   })
      //   .on('click', updateOnClickCluster);

      const gClusterCircles = gClusterPlot
        .selectAll('.cluster_circle')
        .data(clusters)
        .enter()
        .append('g')
        .attr('class', (d, i) => 'g_cluster_circles g_cluster_circles_' + i);

      const yGroupCoordScale = d3
        .scaleBand()
        .domain([0, 1])
        .range([lCom.clusterPlot.maxR * 2, lCom.clusterPlot.h]);

      gClusterCircles.each(function(d, i) {
        const currentCl = d3.select(this);

        // Cluster circles as a whole
        currentCl
          .append('circle')
          .attr('class', (d, i) => 'cluster_circles cluster_circles_' + i)
          .attr(
            'cx',
            d =>
              xClusterCoordScale(d.clusterId) +
              xClusterCoordScale.bandwidth() / 2
          )
          .attr('cy', d => 0)
          .attr('r', d => numTweetClusterScale(d.numTweets))
          .style('fill', d => groupRatioScale(d.groupRatio.con))
          .style('fill-opacity', 0.5)
          .style('stroke', d =>
            d3.rgb(groupRatioScale(d.groupRatio.con)).darker()
          )
          .on('mouseover', function(d) {
            d3.select(this).style(
              'fill',
              d3.rgb(d3.select(this).style('fill')).darker()
            );
          })
          .on('mouseout', function(d) {
            d3.select(this).style(
              'fill',
              d3.rgb(d3.select(this).style('fill')).brighter()
            );
          })
          .on('click', updateOnClickCluster);

        // Cluster circles for each group
        groups.forEach((group, group_idx) => {
          currentCl
            .append('circle')
            .attr(
              'cx',
              d =>
                xClusterCoordScale(d.clusterId) +
                xClusterCoordScale.bandwidth() / 2
            )
            .attr(
              'cy',
              d =>
                yGroupCoordScale(group_idx) + yGroupCoordScale.bandwidth() / 2
            )
            .attr('r', d =>
              group_idx == 0
                ? numTweetClusterScale(d.numTweets * d.groupRatio.con)
                : numTweetClusterScale(d.numTweets * d.groupRatio.lib)
            )
            .style('fill', d => {
              console.log('d');
              return globalColors.groups[group_idx].color;
            })
            .style('fill-opacity', 0.5)
            .style('stroke', d =>
              group_idx == 0
                ? d3.rgb(groupColorScales[group_idx](d.groupRatio.lib)).darker()
                : d3.rgb(groupColorScales[group_idx](d.groupRatio.con)).darker()
            )
            .on('mouseover', function(d) {
              d3.select(this).style(
                'fill',
                d3.rgb(d3.select(this).style('fill')).darker()
              );
            })
            .on('mouseout', function(d) {
              d3.select(this).style(
                'fill',
                d3.rgb(d3.select(this).style('fill')).brighter()
              );
            })
            .on('click', updateOnClickCluster);
        });
      });

      const clusterTitle = gClusterPlot
        .append('text')
        .text('Cluster')
        .attr('x', -60)
        .attr('y', 0);

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
        if (selectedCluster.classed('cluster_selected') === true) {
          d3.select(this)
            .classed('cluster_selected', false)
            .style('stroke', 'gray')
            .style('stroke-width', '1px');
          console.log('click already selected cluster: ', clusterId);

          // Return back all elements to the normal
          // gFeaturePlot.selectAll('.path_tweet').remove();
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

          const outputProbWrongRectsForLibData = d3
            .selectAll('.rect_output_prob_hist_for_lib_wrong_pred')
            .data(dataBinLibWrongPredTweets);

          outputProbWrongRectsForLibData.exit().remove();

          outputProbWrongRectsForLibData
            .attr(
              'x',
              d =>
                lCom.outputProbPlot.w / 2 -
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
                lCom.outputProbPlot.w / 2 -
                3 -
                xOutputProbWrongHistScale(d.length)
            )
            .attr('width', d => xOutputProbWrongHistScale(d.length));

          // To restore PDP for all
          // For cluster-specific PDPs
          d3.selectAll('.axis').each(function(d, i) {
            var yAxisSetting;

            const drawPDPLine = d3
              .line()
              .x(e => features[d.key].pdScale(e.pdpValue))
              .y(e => features[d.key].scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            const drawPDPArea = d3
              .area()
              .x0(0)
              .x1(e => features[d.key].pdScale(e.pdpValue))
              .y(e => features[d.key].scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            // // For harm and fairness, add ordinal scale + bar chart
            // if (d.key === 'care') {
            //   yAxisSetting = d3
            //     .axisLeft(yCareScale)
            //     .tickValues([1, 0, 3, 2])
            //     .tickFormat(function(d, i) {
            //       return d === 0
            //         ? 'None'
            //         : d === 1
            //         ? 'Virtue'
            //         : d === 2
            //         ? 'Vice'
            //         : 'Both';
            //     })
            //     .tickSize(1);
            //   d3.select(this).call(yAxisSetting);

            //   // For all
            //   d3.select('.g_feature_axis_' + d.key)
            //     .selectAll('.rect_pdp')
            //     .data(pdpValues[d.key])
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'rect_pdp')
            //     .attr('x', 2)
            //     .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
            //     .attr('width', e => xPDProbScale(e.pdpValue))
            //     .attr('height', 10)
            //     .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
            //     // .style('stroke-width', 4)
            //     .style('fill', 'rgb(190, 255, 231)')
            //     // .style('stroke-dasharray', '8,3')
            //     // .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.3);

            //   d3.select('.g_feature_axis_' + d.key)
            //     .selectAll('.rect_pdp_for_con')
            //     .data(pdpValuesForCon[d.key])
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'rect_pdp_for_con')
            //     .attr('x', 2)
            //     .attr('y', e => yPDCareFeatureValueScale(e.featureValue) - 5)
            //     .attr('width', e => xPDProbScale(e.pdpValue))
            //     .attr('height', 5)
            //     .style('stroke', d3.rgb(globalColors.group.con).darker())
            //     // .style('stroke-width', 4)
            //     .style('fill', globalColors.group.con)
            //     // .style('stroke-dasharray', '8,3')
            //     // .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.5);

            //   d3.select('.g_feature_axis_' + d.key)
            //     .selectAll('.rect_pdp_for_lib')
            //     .data(pdpValuesForLib[d.key])
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'rect_pdp_for_lib')
            //     .attr('x', 2)
            //     .attr('y', e => yPDCareFeatureValueScale(e.featureValue))
            //     .attr('width', e => xPDProbScale(e.pdpValue))
            //     .attr('height', 5)
            //     .style('stroke', d3.rgb(globalColors.group.lib).darker())
            //     // .style('stroke-width', 4)
            //     .style('fill', globalColors.group.lib)
            //     // .style('stroke-dasharray', '8,3')
            //     // .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.5);
            //   // For valence and dominance, add linear scale + line chart
            // } else if (d.key === 'fairness') {
            //   yAxisSetting = d3
            //     .axisLeft(yFairnessScale)
            //     .tickValues([1, 0, 2])
            //     .tickFormat(function(d, i) {
            //       return d === 0
            //         ? 'None'
            //         : d === 1
            //         ? 'Virtue'
            //         : d === 2
            //         ? 'Vice'
            //         : 'Both';
            //     })
            //     .tickSize(1);
            //   d3.select(this).call(yAxisSetting);

            //   // For all
            //   d3.select('.g_feature_axis_' + d.key)
            //     .selectAll('.rect_pdp')
            //     .data(pdpValues[d.key])
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'rect_pdp')
            //     .attr('x', 2)
            //     .attr(
            //       'y',
            //       e => yPDFairnessFeatureValueScale(e.featureValue) - 5
            //     )
            //     .attr('width', e => xPDProbScale(e.pdpValue))
            //     .attr('height', 10)
            //     .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
            //     // .style('stroke-width', 4)
            //     .style('fill', 'rgb(190, 255, 231)')
            //     // .style('stroke-dasharray', '8,3')
            //     // .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.3);

            //   d3.select('.g_feature_axis_' + d.key)
            //     .selectAll('.rect_pdp_for_con')
            //     .data(pdpValuesForCon[d.key])
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'rect_pdp_for_con')
            //     .attr('x', 2)
            //     .attr(
            //       'y',
            //       e => yPDFairnessFeatureValueScale(e.featureValue) - 5
            //     )
            //     .attr('width', e => xPDProbScale(e.pdpValue))
            //     .attr('height', 5)
            //     .style('stroke', d3.rgb(globalColors.group.con).darker())
            //     // .style('stroke-width', 4)
            //     .style('fill', globalColors.group.con)
            //     // .style('stroke-dasharray', '8,3')
            //     // .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.5);

            //   d3.select('.g_feature_axis_' + d.key)
            //     .selectAll('.rect_pdp_for_lib')
            //     .data(pdpValuesForLib[d.key])
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'rect_pdp_for_lib')
            //     .attr('x', 2)
            //     .attr('y', e => yPDFairnessFeatureValueScale(e.featureValue))
            //     .attr('width', e => xPDProbScale(e.pdpValue))
            //     .attr('height', 5)
            //     .style('stroke', d3.rgb(globalColors.group.lib).darker())
            //     // .style('stroke-width', 4)
            //     .style('fill', globalColors.group.lib)
            //     // .style('stroke-dasharray', '8,3')
            //     // .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.5);

            //   // const PDPBarsDatumForAll = d3
            //   //   .select('.rect_pdp_' + d.key)
            //   //   .datum(pdpValues);
            //   // const pdpAreaDatumForAll = d3
            //   //   .select('._pdp_' + d.key)
            //   //   .datum(pdpValuesForCls[clusterId]['all'][d.key]);
            //   // const pdpPathDatumForCon = d3
            //   //   .select('.path_pdp_for_con_' + d.key)
            //   //   .datum(pdpValuesForCls[clusterId]['con'][d.key]);
            //   // const pdpAreaDatumForCon = d3
            //   //   .select('.area_pdp_for_con_' + d.key)
            //   //   .datum(pdpValuesForCls[clusterId]['con'][d.key]);
            //   // const pdpPathDatumForLib = d3
            //   //   .selectAll('.path_pdp_for_lib_' + d.key)
            //   //   .datum(pdpValuesForCls[clusterId]['lib'][d.key]);
            //   // const pdpAreaDatumForLib = d3
            //   //   .selectAll('.area_pdp_for_lib_' + d.key)
            //   //   .datum(pdpValuesForCls[clusterId]['lib'][d.key]);

            //   // pdpPathDatumForAll.exit().remove();
            //   // pdpPathDatumForAll.attr('d', drawPDPLine);
            //   // pdpAreaDatumForAll.exit().remove();
            //   // pdpAreaDatumForAll.attr('d', drawPDPArea);

            //   // pdpPathDatumForCon.exit().remove();
            //   // pdpPathDatumForCon.attr('d', drawPDPLine);
            //   // pdpAreaDatumForCon.exit().remove();
            //   // pdpAreaDatumForCon.attr('d', drawPDPArea);

            //   // pdpPathDatumForLib.exit().remove();
            //   // pdpPathDatumForLib.attr('d', drawPDPLine);
            //   // pdpAreaDatumForLib.exit().remove();
            //   // pdpAreaDatumForLib.attr('d', drawPDPArea);
            //   // For valence and dominance, add linear scale + line chart
            // } else {
            //   yAxisSetting = d3
            //     .axisLeft(yVDScale)
            //     .tickValues(d3.range(0, 1.1, 0.2))
            //     .tickSize(1);
            //   d3.select(this).call(yAxisSetting);

            //   //// Add a path (to draw a separate line), and also area (to fill the area)
            //   /// For all
            //   // path
            //   d3.select('.g_feature_axis_' + d.key)
            //     .append('path')
            //     .datum(pdpValues[d.key])
            //     .attr('class', 'path_pdp')
            //     .attr('d', drawPDPLine)
            //     .style('stroke', 'rgb(190, 255, 231)')
            //     .style('stroke-width', 4)
            //     .style('fill', 'none')
            //     // .style('stroke-dasharray', '8,3')
            //     .style('shape-rendering', 'crispedges')
            //     .style('opacity', 1);

            //   // area
            //   d3.select('.g_feature_axis_' + d.key)
            //     .append('path')
            //     .datum(pdpValues[d.key])
            //     .attr('class', 'area_pdp')
            //     .attr('d', drawPDPArea)
            //     .style('stroke', 'none')
            //     .style('fill', 'gray')
            //     .style('stroke-dasharray', '8,3')
            //     .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.3);

            //   /// Path
            //   // For con
            //   d3.select('.g_feature_axis_' + d.key)
            //     .append('path')
            //     .datum(pdpValuesForCon[d.key])
            //     .attr('class', 'path_pdp_for_con')
            //     .attr('d', drawPDPLine)
            //     .style('stroke', globalColors.group.con)
            //     .style('stroke-width', 2)
            //     .style('fill', 'none')
            //     // .style('stroke-dasharray', '8,3')
            //     .style('shape-rendering', 'crispedges')
            //     .style('opacity', 1);

            //   /// For lib
            //   d3.select('.g_feature_axis_' + d.key)
            //     .append('path')
            //     .datum(pdpValuesForLib[d.key])
            //     .attr('class', 'path_pdp_for_lib')
            //     .attr('d', drawPDPLine)
            //     .style('stroke', globalColors.group.lib)
            //     .style('stroke-width', 2)
            //     .style('fill', 'none')
            //     // .style('stroke-dasharray', '8,3')
            //     .style('shape-rendering', 'crispedges')
            //     .style('opacity', 1);

            //   /// Area
            //   // For con
            //   d3.select('.g_feature_axis_' + d.key)
            //     .append('path')
            //     .datum(pdpValuesForCon[d.key])
            //     .attr('class', 'area_pdp_for_con')
            //     .attr('d', drawPDPArea)
            //     .style('stroke', 'none')
            //     .style('fill', globalColors.group.con)
            //     .style('stroke-dasharray', '8,3')
            //     .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.3);

            //   // For lib
            //   d3.select('.g_feature_axis_' + d.key)
            //     .append('path')
            //     .datum(pdpValuesForLib[d.key])
            //     .attr('class', 'area_pdp_for_lib')
            //     .attr('d', drawPDPArea)
            //     .style('stroke', 'none')
            //     .style('fill', globalColors.group.lib)
            //     .style('stroke-dasharray', '8,3')
            //     .style('shape-rendering', 'crispedges')
            //     .style('fill-opacity', 0.3);
            // }
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
          // gFeaturePlot.selectAll('.path_tweet_for_cluster').remove();

          // d3.selectAll('.path_pdp').remove();
          // d3.selectAll('.area_pdp').remove();
          // d3.selectAll('.rect_pdp').remove();
          // d3.selectAll('.path_pdp_for_con').remove();
          // d3.selectAll('.area_pdp_for_con').remove();
          // d3.selectAll('.path_pdp_for_lib').remove();
          // d3.selectAll('.area_pdp_for_lib').remove();
          // d3.selectAll('.rect_pdp_for_con').remove();
          // d3.selectAll('.rect_pdp_for_lib').remove();

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
              features.map(({ key }) => key)
            );
            var tweetPathData = Object.entries(tweetWithSelectedFeatures);
            tweetPathData.group = d.group;

            return tweetPathData;
          });

          d3.select('.g_feature_plot')
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
                lCom.outputProbPlot.w / 2 -
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
                lCom.outputProbPlot.w / 2 -
                3 -
                xOutputProbWrongHistScale(d.length)
            )
            .attr('width', d => xOutputProbWrongHistScale(d.length));

          // For cluster-specific PDPs
          d3.selectAll('.axis').each(function(feature, i) {
            var yAxisSetting;

            const drawPDPLine = d3
              .line()
              .x(e => features[feature.key].pdScale(e.pdpValue))
              .y(e => features[feature.key].scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            const drawPDPArea = d3
              .area()
              .x0(0)
              .x1(e => features[feature.key].pdScale(e.pdpValue))
              .y(e => features[feature.key].scale(e.featureValue))
              .curve(d3.curveCatmullRom);

            if (feature.key == 'care') {
              // For harm and fairness, add ordinal scale + bar chart
              yAxisSetting = d3
                .axisLeft(feature.scale)
                .tickValues(
                  feature.type == 'categorical'
                    ? feature.values.map(e => e.num)
                    : feature.values
                )
                .tickFormat(
                  feature.type == 'categorical'
                    ? feature.values.map(e => e.category)
                    : feature.values
                )
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              const pdpPathDatumForAll = d3
                .select('.path_pdp_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['all'][feature.key]);
              const pdpAreaDatumForAll = d3
                .select('.area_pdp_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['all'][feature.key]);
              const pdpPathDatumForCon = d3
                .select('.path_pdp_for_con_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['con'][feature.key]);
              const pdpAreaDatumForCon = d3
                .select('.area_pdp_for_con_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['con'][feature.key]);
              const pdpPathDatumForLib = d3
                .selectAll('.path_pdp_for_lib_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['lib'][feature.key]);
              const pdpAreaDatumForLib = d3
                .selectAll('.area_pdp_for_lib_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['lib'][feature.key]);

              pdpPathDatumForAll.exit().remove();
              pdpPathDatumForAll.attr('d', drawPDPLine);
              pdpAreaDatumForAll.exit().remove();
              pdpAreaDatumForAll.attr('d', drawPDPArea);

              pdpPathDatumForCon.exit().remove();
              pdpPathDatumForCon.attr('d', drawPDPLine);
              pdpAreaDatumForCon.exit().remove();
              pdpAreaDatumForCon.attr('d', drawPDPArea);

              pdpPathDatumForLib.exit().remove();
              pdpPathDatumForLib.attr('d', drawPDPLine);
              pdpAreaDatumForLib.exit().remove();
              pdpAreaDatumForLib.attr('d', drawPDPArea);

              // For valence and dominance, add linear scale + line chart
            } else {
              yAxisSetting = d3
                .axisLeft(feature.scale)
                .tickValues(d3.range(0, 1.1, 0.2))
                .tickSize(1);
              d3.select(this).call(yAxisSetting);

              //// Add a path (to draw a separate line), and also area (to fill the area)
              /// For all
              const pdpPathDatumForAll = d3
                .select('.path_pdp_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['all'][feature.key]);
              const pdpAreaDatumForAll = d3
                .select('.area_pdp_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['all'][feature.key]);
              const pdpPathDatumForCon = d3
                .select('.path_pdp_for_con_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['con'][feature.key]);
              const pdpAreaDatumForCon = d3
                .select('.area_pdp_for_con_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['con'][feature.key]);
              const pdpPathDatumForLib = d3
                .selectAll('.path_pdp_for_lib_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['lib'][feature.key]);
              const pdpAreaDatumForLib = d3
                .selectAll('.area_pdp_for_lib_' + feature.key)
                .datum(pdpValuesForCls[clusterId]['lib'][feature.key]);

              pdpPathDatumForAll.exit().remove();
              pdpPathDatumForAll.attr('d', drawPDPLine);
              pdpAreaDatumForAll.exit().remove();
              pdpAreaDatumForAll.attr('d', drawPDPArea);

              pdpPathDatumForCon.exit().remove();
              pdpPathDatumForCon.attr('d', drawPDPLine);
              pdpAreaDatumForCon.exit().remove();
              pdpAreaDatumForCon.attr('d', drawPDPArea);

              pdpPathDatumForLib.exit().remove();
              pdpPathDatumForLib.attr('d', drawPDPLine);
              pdpAreaDatumForLib.exit().remove();
              pdpAreaDatumForLib.attr('d', drawPDPArea);
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
          style={{ display: 'flex' }}
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
            <svg
              width={l.w}
              height={l.h}
              viewBox={'0 0 ' + l.w + ' ' + l.h}
              preserveAspectRatio="xMinYMin"
              ref={ref2}
            />
          </div>
        </FeaturePlotViewWrapper>
      </div>
    );
  }
);

export default FeaturePlotView;

import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, lCom} from '../../GlobalStyles';

function ClusterPlot() {
  let dataLoader = [];
  let scaleLoader = [];
  let updateOnClickCluster = function() {};

  function _clusterPlot(selection) {
    const [features, clusters, groups] = dataLoader;

    const [xFeatureScale, xClusterCoordScale, numTweetClusterScale, groupRatioScale, groupColorScales] = scaleLoader;

    const xClusterAxisSetting = d3
        .axisTop(xClusterCoordScale)
        .tickValues([])
        .tickSize(0),
      xClusterAxis = selection
        .append('g')
        .call(xClusterAxisSetting)
        .attr('class', 'g_cluster_x_axis')
        .attr('transform', 'translate(' + 0 + ',' + lCom.clusterPlot.maxR * 2 + ')');

    const drawTweetLine = d3
      .line()
      .x(d => xFeatureScale(d[0]))
      .y((d, i) => features[d[0]].scale(d[1]));

    const gClusterCircles = selection
      .selectAll('.cluster_circle')
      .data(clusters)
      .enter()
      .append('g')
      .attr('class', (d, i) => 'g_cluster_circles g_cluster_circles_' + d.clusterId);

    const yGroupCoordScale = d3
      .scaleBand()
      .domain([0, 1])
      .range([lCom.clusterPlot.maxR * 2, lCom.clusterPlot.h]);

    gClusterCircles.each(function(d, i) {
      const currentCl = d3.select(this);

      // Cluster circles as a whole
      currentCl
        .append('circle')
        .attr('class', (d, i) => 'cluster_circles cluster_circles_' + d.clusterId)
        .attr('cx', d => xClusterCoordScale(d.clusterId) + xClusterCoordScale.bandwidth() / 2)
        .attr('cy', d => 0)
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

      // Cluster circles for each group
      groups.forEach((group, group_idx) => {
        currentCl
          .append('circle')
          .attr('cx', d => xClusterCoordScale(d.clusterId) + xClusterCoordScale.bandwidth() / 2)
          .attr('cy', d => yGroupCoordScale(group_idx) + yGroupCoordScale.bandwidth() / 2)
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
            d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).darker());
          })
          .on('mouseout', function(d) {
            d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).brighter());
          })
          .on('click', updateOnClickCluster);
      });
    });

    const clusterTitle = selection
      .append('text')
      .text('Cluster')
      .attr('x', -60)
      .attr('y', 0);
  }

  _clusterPlot.dataLoader = function(data) {
    if (!arguments.length) return dataLoader;
    dataLoader = data;
    return _clusterPlot;
  };

  _clusterPlot.scaleLoader = function(scales) {
    if (!arguments.length) return scaleLoader;
    scaleLoader = scales;
    return _clusterPlot;
  };

  _clusterPlot.updateOnClickCluster = function(onClickFunc) {
    if (!arguments.length) return updateOnClickCluster;
    updateOnClickCluster = onClickFunc;
    return _clusterPlot;
  };

  return _clusterPlot;
}

export default ClusterPlot;

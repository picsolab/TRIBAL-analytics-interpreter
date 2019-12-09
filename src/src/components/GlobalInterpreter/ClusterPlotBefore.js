import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, lCom} from '../../GlobalStyles';

function ClusterPlot() {
  let dataLoader = [];
  let scaleLoader = [];
  let updateOnClickCluster = function() {};

  function _clusterPlot(selection) {
    const [features, clusters, groups] = dataLoader;

    const [xFeatureScale, yClusterCoordScale, numTweetClusterScale, groupRatioScale, groupColorScales] = scaleLoader;

    const yClusterAxisSetting = d3
        .axisLeft(yClusterCoordScale)
        .tickValues([])
        .tickSize(0),
      xClusterAxis = selection
        .append('g')
        .call(yClusterAxisSetting)
        .attr('class', 'g_cluster_y_axis')
        .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

    const gClusterCircles = selection
      .selectAll('.cluster_circle')
      .data(clusters)
      .enter()
      .append('circle')
      .attr('class', (d, i) => 'cluster_circles cluster_circles_' + d.clusterId)
      .attr('cx', 0)
      .attr('cy', d => yClusterCoordScale(d.clusterId) + yClusterCoordScale.bandwidth() / 2)
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
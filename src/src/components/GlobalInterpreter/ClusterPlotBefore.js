import * as d3 from 'd3';
import _ from 'lodash';
import d3tooltip from 'd3-tooltip';

import {globalColors, lCom} from '../../GlobalStyles';

const tooltip = d3tooltip(d3);

function ClusterPlot() {
  let dataLoader = [];
  let scaleLoader = [];
  let updateOnClickCluster = function() {};

  function _clusterPlot(selection) {
    const [features, clusters, groups, tweets, clusterIdsForTweets] = dataLoader;

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
      .attr('class', (d, i) => 'cluster_circle cluster_circle_' + d.clusterId)
      .attr('cx', 0)
      .attr('cy', d => yClusterCoordScale(d.clusterId) + yClusterCoordScale.bandwidth() / 2)
      .attr('r', d => numTweetClusterScale(d.numTweets))
      .style('fill', d => groupRatioScale(d.groupRatio.lib))
      .style('fill-opacity', 0.5)
      .style('stroke', d => d3.rgb(groupRatioScale(d.groupRatio.lib)).darker())
      .on('mouseover', function(d, i) {
        d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).darker());

        d3.selectAll('.subgroup_rect_' + d.clusterId)
            .style('stroke', 'orange')
            .style('stroke-width', 1.5);

        console.log('cluster-before')

        const clusterHtml =
          '<div style="font-weight: 600">' +
          'Cluster Id: ' +
          (i+1) +
          '</br>' +
          '# of tweets: ' +
          d.numTweets +
          '</div>';

        tooltip.html(clusterHtml);
        tooltip.show();
      })
      .on('mouseout', function(d) {
        d3.select(this).style('fill', d3.rgb(d3.select(this).style('fill')).brighter());
        d3.selectAll('.subgroup_rect_' + d.clusterId)
            .style('stroke', 'black')
            .style('stroke-width', 0.5);
        tooltip.hide();
      })
      .on('click', updateOnClickCluster);

    const clusterTitle = selection
      .datum(clusterIdsForTweets)
      .append('text')
      .attr('class', 'cluster_plot_title')
      .text('Cluster')
      .attr('x', -50)
      .attr('y', -20)
      .style('font-size', '17px');
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

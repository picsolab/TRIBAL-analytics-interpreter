import * as d3 from 'd3';
import _ from 'lodash';
import d3tooltip from 'd3-tooltip';

import {globalColors, l, ll, lCom} from '../../GlobalStyles';

const tooltip = d3tooltip(d3);

function Axes() {
  var width = 720,
    height = 80;
  let axisMode = '';
  let dataForTweets = [];
  let dataForClusters = [];
  let dataForClusterIds = [];
  let dataForFeatures = [];
  let dataForPdpValues = [];
  let dataForPdpValuesForGroups = [];
  let dataForFeatureImps = [];

  var xFeatureScale = '';

  function _axes(selection) {
    const mode = axisMode;
    const tweets = dataForTweets;
    const clusters = dataForClusters;
    const clusterIds = dataForClusterIds;
    const features = dataForFeatures;
    const pdpValues = dataForPdpValues;
    const pdpValuesForGroups = dataForPdpValuesForGroups;
    const featureImps = dataForFeatureImps;

    const featureAxes = selection
      .enter()
      .append('g')
      .attr('class', function(d) {
        return 'g_axis g_feature_axis g_feature_axis_' + d.key;
      })
      .attr('transform', function(d, i) {
        return 'translate(' + xFeatureScale(d.key) + ')';
      });

    let cumGroupSizeRatio = [];
    const totalNumInstances = tweets.length;
    const tweetsInGroups = _(tweets)
      .groupBy('clusterId')
      .value();

    // const clusters = _.values(tweetsInGroups).map(cl => {
    //   const tweetsInGroup0 = cl.map(d => d.group == '0');

    //   return {
    //     size: cl.length,
    //     groupRatio: tweetsInGroup0.length / totalNumInstances
    //   }
    // });


    let cumGroupRatio = 0;
    clusters.forEach((cl) => {
      cumGroupRatio = cumGroupRatio + cl.numTweets / totalNumInstances * 50;
      cumGroupSizeRatio.push(cumGroupRatio);
    });

    featureAxes
      .append('g')
      .each(function(feature, i) {
        let yAxisSetting;
        const featureName = feature.key;
        const gFeatureAxis = d3.select('.g_feature_axis_' + featureName);
        const tweetsForFeature = tweets.map(d => ({
          clusterId: d.clusterId,
          feature: d[featureName]
        }));

        // Axis rectangle
        gFeatureAxis
          .append('rect')
          .attr('class', 'axis_rect axis_rect_' + featureName)
          .attr('x', 0)
          .attr('y', -lCom.hPlot.featurePlot.axis.m)
          .attr('width', lCom.hPlot.featurePlot.axis.w)
          .attr('height', lCom.hPlot.featurePlot.axis.h + lCom.hPlot.featurePlot.axis.m * 2)
          .style('stroke', 'black')
          .style('stroke-width', 2)
          .style('fill', 'whitesmoke')
          .style('fill-opacity', 0.5);

        // Feature titles
        gFeatureAxis
          .datum(feature)
          .append('text')
          .attr('class', 'feature_title_in_axis')
          .text(feature.key)
          .attr("transform", "rotate(-25 20 -30)")
          .attr('x', lCom.hPlot.featurePlot.titles.m - 10)
          .attr('y', -lCom.hPlot.featurePlot.titles.m)
          .attr('font-size', '0.8rem')
          .attr('font-weight', 600);

        renderSubgroupAxis(gFeatureAxis, tweetsForFeature);
        renderPdpAxis();

        if (mode == 'pdp') {
          d3.selectAll('.subgroup_rect').style('opacity', 0);
          d3.selectAll('.path_pdp').style('opacity', '');
          d3.selectAll('.area_pdp').style('opacity', '');
          d3.selectAll('.rect_pdp').style('opacity', '');
        }
        else if (mode == 'subgroup') {
          d3.selectAll('.subgroup_rect').style('opacity', '');
          d3.selectAll('.path_pdp').style('opacity', 0);
          d3.selectAll('.area_pdp').style('opacity', 0);
          d3.selectAll('.rect_pdp').style('opacity', 0);
        }
          

        // Render components for subgroups
        function renderSubgroupAxis(gFeatureAxis, tweetsForFeature) {
          const featureScale = feature.type == 'continuous' 
            ? feature.scale
            : d3.scaleLinear()
              .domain([_.min(feature.scale.domain()), _.max(feature.scale.domain())])  // Treat cateogorical features as continuous
              .range([160, 0]);

          const xGroupScale = d3.scaleOrdinal()
            .domain(d3.range(9))
            .range(cumGroupSizeRatio);

          const groupRatioScale = d3.scaleLinear()
            .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
            .range(['#CB4335', '#E74C3C', '#FADBD8', '#D7DBFF', '#7584FF', '#001BFF']);

          yAxisSetting = d3
            .axisLeft(featureScale)
            //.tickValues(feature.type == 'categorical' ? feature.values.map(e => e.num) : feature.values)
            // .tickFormat(
            //   (feature.type == 'categorical') 
            //     ? (d, i) => feature.values[d].category
            //     : (d, i) => d
            // )
            .tickSize(0);
          d3.select(this).call(yAxisSetting);

          // d3.select(this)
          //     .selectAll('.subgroup_rect')
          //     .data(d3.range(9)).enter()

          clusters.forEach(function(cl, clId) {
            const instancesForCl = tweetsForFeature.filter(d => d.clusterId == cl.clusterId);

            const featureValues = instancesForCl.map(d => d.feature);
            const featureMean = _.mean(featureValues),
              featureSD = Math.sqrt(_.sum(_.map(featureValues, (i) => Math.pow((i - featureMean), 2))) / featureValues.length);
            const third_quantile = featureMean + featureSD*0.6745,
              first_quantile = featureMean - featureSD*0.6745 < 0 
                ? (featureMean - featureSD*0.6745)/5 
                : featureMean - featureSD*0.6745;

            gFeatureAxis
              .append('rect')
              .attr('class', 'subgroup_rect subgroup_rect_' + cl.clusterId)
              .attr('x', clId == 0 ? 0 : xGroupScale(clId-1))
              .attr('y', featureScale(third_quantile)+5)
              .attr('width', clId == 0 ? xGroupScale(clId) : xGroupScale(clId)-xGroupScale(clId-1))
              .attr('height', featureScale(first_quantile)-featureScale(third_quantile) == 0 ? 4 : featureScale(first_quantile)-featureScale(third_quantile))
              .style('stroke', 'black')
              .style('stroke', 0.25)
              .style('fill', groupRatioScale(cl.groupRatio.lib))
              .on('mouseover', function(d, i) {
                d3.select(this)
                  .style('stroke', 'orange')
                  .style('stroke-width', 2);
                  console.log('featureMean and SD: ', cl.clusterId, featureMean, featureSD)
                  // const subgroupHtml =
                  //   '<div style="font-weight: 600">' +
                  //   'Subgroup Id: ' +
                  //   (i+1) +
                  //   '</br>' +
                  //   'Mean: ' +
                  //   featureMean +
                  //   'sd: ' +
                  //   featureSD +
                  //   '</div>';

                  // tooltip.html(subgroupHtml);
                  // tooltip.show();
              })
              .on('mouseout', function(d) {
                d3.select(this)
                  .style('stroke', 'black')
                  .style('stroke-width', 0.5);
                // tooltip.hide();
              })
            
            var triangleSize = 20;
            var verticalTransform = 180 + Math.sqrt(triangleSize);
  
            const triangle = d3.symbol()
                    .type(d3.symbolTriangle)
                    .size(triangleSize);
  
            gFeatureAxis.append('path')
              .attr('class', 'point_to_subgroup_for_selected_instance ' + 'subgroup_' + clId)
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", 'black')
              .attr("transform", function(d) { 
                const x = clId == 0 ? 0 : xGroupScale(clId-1);
                return "translate(" + x + "," + (-10) + ")rotate(180)"; 
              });
          });
        }

        // Render components for pdp
        function renderPdpAxis() {
          const drawPDPLine = d3
            .line()
            .x(e => features[i].pdScale(e.pdpValue))
            .y(e => features[i].scale(e.featureValue))
            .curve(d3.curveCatmullRom);

          const drawPDPArea = d3
            .area()
            .x0(0)
            .x1(e => features[i].pdScale(e.pdpValue))
            .y(e => features[i].scale(e.featureValue))
            .curve(d3.curveCatmullRom);

          const pdpValuesPerFeature = pdpValues.filter(e => e.feature === featureName)[0].values;

          yAxisSetting = d3
            .axisLeft(feature.scale)
            .tickValues(feature.type == 'categorical' ? feature.values.map(e => e.num) : feature.values)
            .tickFormat(
              (feature.type == 'categorical') 
                ? (d, i) => feature.values[d].category
                : (d, i) => d
            )
            .tickSize(0);
          d3.select(this).call(yAxisSetting);

          
          // Feature importance bar for each feature
          const featureImpScale = d3.scaleLinear()
              .domain(d3.extent(featureImps))
              .range([0, 30]);

          gFeatureAxis
            .append('rect')
            .attr('class', 'feature_imp_rect_' + featureName)
            .attr('x', 0)
            .attr('y', -lCom.hPlot.featurePlot.axis.m*3+1)
            .attr('width', featureImpScale(featureImps[i]))
            .attr('height', lCom.hPlot.featurePlot.axis.m*2 - 3)
            .style('fill', '#66cdaa99')
            .style('stroke', 'mediumaquamarine')

          // if it's categorical, render bar chart PDPs for each category
          if (feature.type == 'categorical') {
            // For PDP for all
            // d3.select('.g_feature_axis_' + featureName)
            //   .selectAll('.rect_pdp_' + featureName)
            //   .data(pdpValuesPerFeature)
            //   .enter()
            //   .append('rect')
            //   .attr('class', 'rect_pdp rect_pdp_' + featureName)
            //   .attr('x', 2)
            //   .attr('y', e => feature.scale(e.featureValue) + feature.scale.bandwidth() / 2 - 5)
            //   .attr('width', e => feature.pdScale(e.pdpValue))
            //   .attr('height', 10)
            //   .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
            //   .style('fill', 'rgb(190, 255, 231)')
            //   .style('fill-opacity', 0.3);

            // For per-group PDP
            pdpValuesForGroups.forEach((pdpValuesObjForGroup, groupIdx) => {
              // an object { 'group': 'con',
              //            'valuesForFeatures': [ { 'feature': 'valence', values: [ VALUES ] }, ... ];
              const pdpValuesForGroupPerFeature = pdpValuesObjForGroup.valuesForFeatures.filter(e => e.feature === featureName)[0]
                .values;
              const groupName = pdpValuesObjForGroup.group.abbr;

              d3.select('.g_feature_axis_' + feature.key)
                .selectAll('.rect_pdp_' + feature.key + '_for_' + groupName)
                .data(pdpValuesForGroupPerFeature)
                .enter()
                .append('rect')
                .attr('class', 'rect_pdp rect_pdp_' + feature.key + '_for_' + groupName)
                .attr('x', 2)
                .attr('y', (e, i) =>
                  groupIdx === 0
                    ? feature.scale(e.featureValue) + feature.scale.bandwidth() / 2 - 5
                    : feature.scale(e.featureValue) + feature.scale.bandwidth() / 2
                )
                .attr('width', e => feature.pdScale(e.pdpValue))
                .attr('height', 5)
                .style('stroke', d3.rgb(globalColors.groups[groupIdx].color).darker())
                .style('fill', globalColors.groups[groupIdx].color)
                .style('fill-opacity', 0.3);
            });
            // if it's continuous, render area chart PDP
          } else if (feature.type === 'continuous') {
            // For PDP as a whole
            // d3.select('.g_feature_axis_' + feature.key)
            //   .selectAll('.rect_pdp')
            //   .data(pdpvaluesPerFeature)
            //   .enter()
            //   .append('rect')
            //   .attr('class', 'rect_pdp')
            //   .attr('x', 2)
            //   .attr('y', e => feature.scale(e.featureValue) - 5)
            //   .attr('width', e => feature.pdScale(e.pdpValue))
            //   .attr('height', 10)
            //   .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
            //   .style('fill', 'rgb(190, 255, 231)')
            //   .style('fill-opacity', 0.3);

            // d3.select('.g_feature_axis_' + feature.key)
            //   .append('path')
            //   .datum(pdpValuesPerFeature)
            //   .attr('class', 'path_pdp path_pdp_' + feature.key)
            //   .attr('d', drawPDPLine)
            //   .style('stroke', 'rgb(190, 255, 231)')
            //   .style('stroke-width', 4)
            //   .style('fill', 'none')
            //   // .style('stroke-dasharray', '8,3')
            //   .style('shape-rendering', 'crispedges')
            //   .style('opacity', 1);

            // area
            // d3.select('.g_feature_axis_' + feature.key)
            //   .append('path')
            //   .datum(pdpValuesPerFeature)
            //   .attr('class', 'area_pdp area_pdp_' + feature.key)
            //   .attr('d', drawPDPArea)
            //   .style('stroke', 'none')
            //   .style('fill', 'gray')
            //   .style('stroke-dasharray', '8,3')
            //   .style('shape-rendering', 'crispedges')
            //   .style('fill-opacity', 0.3);

            // For per-group PDP
            pdpValuesForGroups.forEach((pdpValuesObjForGroup, groupIdx) => {
              // an object { 'group': 'con',
              //            'valuesForFeatures': [ { 'feature': 'valence', values: [ VALUES ] }, ... ];
              const pdpvaluesForGroupsPerFeature = pdpValuesObjForGroup.valuesForFeatures.filter(e => e.feature === featureName)[0]
                .values;
              const groupName = pdpValuesObjForGroup.group.abbr;
              console.log('pdpvaluesForGroupsPerFeature: ', pdpvaluesForGroupsPerFeature)

              // Path
              d3.select('.g_feature_axis_' + feature.key)
                .append('path')
                .datum(pdpvaluesForGroupsPerFeature)
                .attr('class', 'path_pdp path_pdp_' + feature.key + '_for_' + groupName)
                .attr('d', drawPDPLine)
                .style('stroke', globalColors.groups[groupIdx].color)
                .style('stroke-width', 2)
                .style('fill', 'none')
                .style('shape-rendering', 'crispedges')
                .style('opacity', 1);

              // Area
              d3.select('.g_feature_axis_' + feature.key)
                .append('path')
                .datum(pdpvaluesForGroupsPerFeature)
                .attr('class', 'area_pdp area_pdp_' + feature.key + '_for_' + groupName)
                .attr('d', drawPDPArea)
                .style('stroke', 'none')
                .style('fill', globalColors.groups[groupIdx].color)
                .style('stroke-dasharray', '8,3')
                .style('shape-rendering', 'crispedges')
                .style('fill-opacity', 0.3);
            });
          }
        }
      })
      .append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'start');
  }

  _axes.axisMode = function(value) {
    if (!arguments.length) return axisMode;
    axisMode = value;
    return _axes;
  };

  _axes.dataForTweets = function(value) {
    if (!arguments.length) return dataForTweets;
    dataForTweets = value;
    return _axes;
  };

  _axes.dataForClusters = function(value) {
    if (!arguments.length) return dataForClusters;
    dataForClusters = value;
    return _axes;
  };

  _axes.dataForClusterIds = function(value) {
    if (!arguments.length) return dataForClusterIds;
    dataForClusterIds = value;
    return _axes;
  };

  _axes.dataForFeatures = function(value) {
    if (!arguments.length) return dataForFeatures;
    dataForFeatures = value;
    return _axes;
  };

  _axes.dataForPdpValues = function(value) {
    if (!arguments.length) return dataForPdpValues;
    dataForPdpValues = value;
    return _axes;
  };

  _axes.dataForPdpValuesForGroups = function(value) {
    if (!arguments.length) return dataForPdpValuesForGroups;
    dataForPdpValuesForGroups = value;
    return _axes;
  };

  _axes.dataForFeatureImps = function(value) {
    if (!arguments.length) return dataForFeatureImps;
    dataForFeatureImps = value;
    return _axes;
  };

  _axes.xFeatureScale = function(value) {
    if (!arguments.length) return xFeatureScale;
    xFeatureScale = value;
    return _axes;
  };

  _axes.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return _axes;
  };

  _axes.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return _axes;
  };

  // my.onC('click', function(d, i) {
  //   console.log('my is clicked');
  // });

  return _axes;
}

export default Axes;

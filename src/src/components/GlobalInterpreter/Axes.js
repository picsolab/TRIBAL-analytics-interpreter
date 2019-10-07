import * as d3 from 'd3';
import _ from 'lodash';

import { globalColors, l, ll, lCom } from '../../GlobalStyles';

function Axes() {
  var width = 720,
    height = 80;
  let dataForFeatures = [];
  let dataForPdpValues = [];
  let dataForPdpValuesForGroups = [];

  var xFeatureScale = '';

  function _axes(selection) {
    const features = dataForFeatures;
    const pdpValues = dataForPdpValues;
    const pdpValuesForGroups = dataForPdpValuesForGroups;

    const featureAxes = selection
      .enter()
      .append('g')
      .attr('class', function(d) {
        return 'axis g_feature_axis g_feature_axis_' + d.key;
      })
      .attr('transform', function(d, i) {
        return 'translate(' + xFeatureScale(d.key) + ')';
      });

    featureAxes
      .append('g')
      .each(function(feature, i) {
        let yAxisSetting;
        const featureName = feature.key;

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

        const pdpvaluesPerFeature = pdpValues.filter(
          e => e.feature === featureName
        )[0].values;

        yAxisSetting = d3
          .axisLeft(feature.scale)
          .tickValues(
            feature.type == 'categorical'
              ? feature.values.map(e => e.num)
              : feature.values
          )
          .tickFormat(
            feature.type == 'categorical'
              ? (d, i) =>
                  d === 0
                    ? 'None'
                    : d === 1
                    ? 'Virtue'
                    : d === 2
                    ? 'Vice'
                    : 'Both'
              : (d, i) => d
          )
          .tickSize(5);
        d3.select(this).call(yAxisSetting);

        d3.select('.g_feature_axis_' + feature.key)
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', lCom.hPlot.featurePlot.axis.w)
          .attr('height', lCom.hPlot.featurePlot.axis.h)
          .style('stroke', 'lightgray')
          .style('stroke-width', 0.5)
          .style('fill', 'whitesmoke')
          .style('fill-opacity', 0.5);

        // if it's categorical, render bar chart PDPs for each category
        if (feature.type == 'categorical') {
          // For PDP as a whole
          d3.select('.g_feature_axis_' + feature.key)
            .selectAll('.rect_pdp')
            .data(pdpvaluesPerFeature)
            .enter()
            .append('rect')
            .attr('class', 'rect_pdp')
            .attr('x', 2)
            .attr('y', e => feature.scale(e.featureValue) - 5)
            .attr('width', e => feature.pdScale(e.pdpValue))
            .attr('height', 10)
            .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
            .style('fill', 'rgb(190, 255, 231)')
            .style('fill-opacity', 0.3);

          // For per-group PDP
          pdpValuesForGroups.forEach(pdpValuesObjForGroup => {
            // an object { 'group': 'con',
            //            'valuesForFeatures': [ { 'feature': 'valence', values: [ VALUES ] }, ... ];
            const pdpvaluesForGroupsPerFeature = pdpValuesObjForGroup.valuesForFeatures.filter(
              e => e.feature === featureName
            )[0].values;
            const groupName = pdpValuesObjForGroup.group.abbr;

            d3.select('.g_feature_axis_' + feature.key)
              .selectAll('.rect_pdp_' + groupName)
              .data(pdpvaluesForGroupsPerFeature)
              .enter()
              .append('rect')
              .attr('class', 'rect_pdp_' + groupName)
              .attr('x', 2)
              .attr('y', e => feature.scale(e.featureValue) - 5)
              .attr('width', e => feature.pdScale(e.pdpValue))
              .attr('height', 5)
              .style('stroke', d3.rgb(globalColors.group[groupName]).darker())
              .style('fill', globalColors.group[groupName])
              .style('fill-opacity', 0.3);
          });
          // if it's continuous, render area chart PDP
        } else if (feature.type === 'continuous') {
          // For PDP as a whole
          d3.select('.g_feature_axis_' + feature.key)
            .selectAll('.rect_pdp')
            .data(pdpvaluesPerFeature)
            .enter()
            .append('rect')
            .attr('class', 'rect_pdp')
            .attr('x', 2)
            .attr('y', e => feature.scale(e.featureValue) - 5)
            .attr('width', e => feature.pdScale(e.pdpValue))
            .attr('height', 10)
            .style('stroke', d3.rgb('rgb(190, 255, 231)').darker())
            .style('fill', 'rgb(190, 255, 231)')
            .style('fill-opacity', 0.3);

          d3.select('.g_feature_axis_' + feature.key)
            .append('path')
            .datum(pdpvaluesPerFeature)
            .attr('class', 'path_pdp_' + feature.key)
            .attr('d', drawPDPLine)
            .style('stroke', 'rgb(190, 255, 231)')
            .style('stroke-width', 4)
            .style('fill', 'none')
            // .style('stroke-dasharray', '8,3')
            .style('shape-rendering', 'crispedges')
            .style('opacity', 1);

          // area
          d3.select('.g_feature_axis_' + feature.key)
            .append('path')
            .datum(pdpvaluesPerFeature)
            .attr('class', 'area_pdp_' + feature.key)
            .attr('d', drawPDPArea)
            .style('stroke', 'none')
            .style('fill', 'gray')
            .style('stroke-dasharray', '8,3')
            .style('shape-rendering', 'crispedges')
            .style('fill-opacity', 0.3);

          // For per-group PDP
          pdpValuesForGroups.forEach(pdpValuesObjForGroup => {
            // an object { 'group': 'con',
            //            'valuesForFeatures': [ { 'feature': 'valence', values: [ VALUES ] }, ... ];
            const pdpvaluesForGroupsPerFeature = pdpValuesObjForGroup.valuesForFeatures.filter(
              e => e.feature === featureName
            )[0].values;
            const groupName = pdpValuesObjForGroup.group.abbr;

            // Path
            d3.select('.g_feature_axis_' + feature.key)
              .append('path')
              .datum(pdpvaluesForGroupsPerFeature)
              .attr('class', 'path_pdp_' + groupName)
              .attr('d', drawPDPLine)
              .style('stroke', globalColors.group[groupName])
              .style('stroke-width', 2)
              .style('fill', 'none')
              .style('shape-rendering', 'crispedges')
              .style('opacity', 1);

            // Area
            d3.select('.g_feature_axis_' + feature.key)
              .append('path')
              .datum(pdpvaluesForGroupsPerFeature)
              .attr('class', 'area_pdp_' + groupName)
              .attr('d', drawPDPArea)
              .style('stroke', 'none')
              .style('fill', globalColors.group[groupName])
              .style('stroke-dasharray', '8,3')
              .style('shape-rendering', 'crispedges')
              .style('fill-opacity', 0.3);
          });
        }
      })
      .append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'start');
  }

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

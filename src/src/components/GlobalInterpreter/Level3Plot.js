import * as d3 from 'd3';
import _ from 'lodash';

import { globalColors, lCom } from '../../GlobalStyles';

function Level3Plot() {
  var width = 720, // default width
    height = 80; // default height

  var xWordScale = '';

  function _level3Plot(selection) {
    const wordData = selection.enter().data(), // [ {'word': 'dog', 'count': 3}, {...}, ...]
      wordCounts = wordData.map(d => d.countTotal);

    const wordCountScale = d3
      .scaleLinear()
      .domain(d3.extent(wordCounts))
      .range([5, 15]);

    const groupColorScale = d3
      .scaleOrdinal()
      .domain([1, 0])
      .range([globalColors.group.lib, globalColors.group.con]);

    const xWordAxisSetting = d3.axisBottom(xWordScale),
      xWordAxis = d3
        .select('.g_level3')
        .append('g')
        .call(xWordAxisSetting)
        .attr('class', 'g_word_x_axis')
        .attr('transform', 'translate(0,' + lCom.hPlot.wordPlot.word.h + ')')
        .selectAll('text')
        .style('text-anchor', 'start')
        .attr('dx', '.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(45)');

    selection
      .enter()
      .append('rect')
      .attr('class', 'word_rect')
      .attr('x', (d, i) => xWordScale(d.word))
      .attr('y', 0)
      .attr('width', d => wordCountScale(d.countTotal))
      .attr('height', lCom.hPlot.wordPlot.word.h)
      .style('fill', d =>
        d.countGroup0 > d.countGroup1
          ? globalColors.group.con
          : globalColors.group.lib
      )
      .style('fill-opacity', 0.5);
    // .style('stroke', d3.rgb(globalColors.group.lib).darker());
  }

  _level3Plot.xWordScale = function(xScale) {
    if (!arguments.length) return xScale;
    xWordScale = xScale;
    return _level3Plot;
  };

  _level3Plot.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return _level3Plot;
  };

  _level3Plot.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return _level3Plot;
  };

  return _level3Plot;
}

export default Level3Plot;

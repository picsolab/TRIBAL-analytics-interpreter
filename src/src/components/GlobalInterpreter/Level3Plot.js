import * as d3 from 'd3';
import _ from 'lodash';

import { globalColors, lCom } from '../../GlobalStyles';

function Level3Plot() {
  var width = 720, // default width
    height = 80; // default height

  let dataForWords = [];
  let dataForCooc = [];
  var xWordScale = '';
  var coocThreshold = 0;

  function _level3Plot(selection) {
    const words = dataForWords, // [ {'word': 'dog', 'count': 3}, {...}, ...]
      cooc = dataForCooc,
      wordCounts = words.map(d => d.countTotal),
      threshold = coocThreshold;

    let coocList = [];
    for (let word1 in cooc) {
      let coocObj = cooc[word1];
      for (let word2 in coocObj) {
        coocList.push({ wordPair: [word1, word2], score: coocObj[word2] });
      }
    }

    const wordCountScale = d3
      .scaleLinear()
      .domain(d3.extent(wordCounts))
      .range([5, 15]);

    const groupColorScale = d3
      .scaleOrdinal()
      .domain([1, 0])
      .range(globalColors.groups.map(d => d.color));

    const coocScale = d3
      .scaleLinear()
      .domain(d3.extent(coocList.map(d => d.score)))
      .range([1, xWordScale.bandwidth() / 2]);

    const coorArcs = selection
      .append('g')
      .attr('class', 'g_arcs')
      .attr(
        'transform',
        'translate(' +
          xWordScale.bandwidth() / 2 +
          ',' +
          lCom.hPlot.wordPlot.word.maxH +
          ')'
      )
      .selectAll('.word_arc')
      .data(coocList.filter(d => d.score > threshold))
      .enter()
      .append('path')
      .attr('class', 'word_arc')
      .attr('d', d => {
        let wordOnLeft;
        let wordOnRight;

        if (xWordScale(d.wordPair[0]) > xWordScale(d.wordPair[1])) {
          wordOnLeft = d.wordPair[1];
          wordOnRight = d.wordPair[0];
        } else {
          wordOnLeft = d.wordPair[0];
          wordOnRight = d.wordPair[1];
        }

        return draw(
          d3.path(),
          xWordScale(wordOnLeft),
          0,
          xWordScale(wordOnLeft) +
            (xWordScale(wordOnRight) - xWordScale(wordOnLeft)) / 2,
          50 *
            (1 +
              (xWordScale(wordOnRight) - xWordScale(wordOnLeft)) /
                lCom.hPlot.w),
          xWordScale(wordOnRight),
          0
        );
      })
      .style('fill', 'none')
      .style('stroke', 'lightgray')
      .style('opacity', 0.2)
      .style('stroke-width', d => coocScale(d.score));

    const xWordAxisSetting = d3.axisBottom(xWordScale),
      xWordAxis = d3
        .select('.g_level3')
        .append('g')
        .call(xWordAxisSetting)
        .attr('class', 'g_word_x_axis')
        .attr('transform', 'translate(0,' + lCom.hPlot.wordPlot.word.maxH + ')')
        .selectAll('text')
        .style('text-anchor', 'start')
        .attr('dx', '.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(45)');

    selection
      .selectAll('.word_rect')
      .data(words)
      .enter()
      .append('rect')
      .attr('class', 'word_rect')
      .attr('x', (d, i) => xWordScale(d.word))
      .attr(
        'y',
        d => lCom.hPlot.wordPlot.word.maxH - wordCountScale(d.countTotal)
      )
      .attr('width', xWordScale.bandwidth() - (xWordScale.bandwidth() / 3) * 2)
      .attr('height', d => wordCountScale(d.countTotal))
      .style('fill', d => {
        //   const maxCnt = 0;
        //   let maxGroupIdx;
        //   groups.forEach((group, groupIdx) => {
        //     if (d.countGroup[groupIdx].count > maxCnt) maxGroupIdx = groupIdx;
        //   });

        //   return globalColors.groups[groupIdx].color;
        return d.countGroup[0]['count'] > d.countGroup[1]['count']
          ? globalColors.group.con
          : globalColors.group.lib;
      })
      .style('fill-opacity', 0.5);

    // Render cooccurrence arc between words
    let path = d3.path();
    function draw(context, startX, startY, controlX, controlY, endX, endY) {
      context.moveTo(startX, startY);
      context.quadraticCurveTo(controlX, controlY, endX, endY);

      return context;
    }
  }

  function describeArc(x, y, radius, startAngle, endAngle) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    var d = [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y
    ].join(' ');

    return d;
  }

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = ((angleInDegrees - 120) * Math.PI) / 150.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  _level3Plot.dataForWords = function(words) {
    if (!arguments.length) return dataForWords;
    dataForWords = words;
    return _level3Plot;
  };

  _level3Plot.dataForCooc = function(cooc) {
    if (!arguments.length) return dataForCooc;
    dataForCooc = cooc;
    return _level3Plot;
  };

  _level3Plot.xWordScale = function(xScale) {
    if (!arguments.length) return xScale;
    xWordScale = xScale;
    return _level3Plot;
  };

  _level3Plot.coocThreshold = function(value) {
    if (!arguments.length) return value;
    coocThreshold = value;
    return _level3Plot;
  };

  return _level3Plot;
}

export default Level3Plot;

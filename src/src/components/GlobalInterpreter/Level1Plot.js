import * as d3 from 'd3';
import _ from 'lodash';

import { globalColors, lCom } from '../../GlobalStyles';

const layout = {
  wordPlot: {
    w: 800,
    h: 100
  },
  word: {
    w: 20,
    h: 20,
    m: {
      r: 10
    }
  }
};

function Level1Plot() {
  let dataForGoals = []; // [ 'emotion', 'moral' ]
  let xGoalScale = '';

  function _level1Plot(selection) {
    const goals = dataForGoals;

    selection
      .selectAll('.goal_rect')
      .data(goals)
      .enter()
      .append('rect')
      .attr('class', 'goal_rect')
      .attr('x', (d, i) => xGoalScale(d))
      .attr('y', lCom.hPlot.goalPlot.goalRect.t)
      .attr('width', (d, i) =>
        i == dataForGoals.length - 1
          ? xGoalScale.bandwidth()
          : xGoalScale.bandwidth() - lCom.hPlot.goalPlot.m
      )
      .attr('height', lCom.hPlot.goalPlot.goalRect.h)
      .style('fill', 'black')
      .style('fill-opacity', 0.5)
      .style('stroke', 'none');

    selection
      .selectAll('.goal_title')
      .data(goals)
      .enter()
      .append('text')
      .attr('class', 'goal_title')
      .text(d => d)
      .attr('x', (d, i) => xGoalScale(d))
      .attr(
        'y',
        lCom.hPlot.goalPlot.goalTitle.t +
          lCom.hPlot.goalPlot.goalTitle.textHeight
      )
      .style('font-style', 'italic');
  }

  _level1Plot.dataForGoals = function(value) {
    if (!arguments.length) return dataForGoals;
    dataForGoals = value;
    return _level1Plot;
  };

  _level1Plot.xGoalScale = function(value) {
    if (!arguments.length) return xGoalScale;
    xGoalScale = value;
    return _level1Plot;
  };

  return _level1Plot;
}

export default Level1Plot;

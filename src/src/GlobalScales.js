import * as d3 from 'd3';
import { globalColors } from './GlobalStyles';

export const globalScales = {
  groupColorScale: d3
    .scaleOrdinal()
    .domain([1, 0])
    .range(globalColors.groups.map(d => d.color)),

  groupColorScales: [],

  groupWrongColorScale: d3
    .scaleOrdinal()
    .domain([1, 0])
    .range(['gray', globalColors.group.wrong.con]),

  groupRatioScale: d3
    .scaleLinear()
    .domain([0, 0.5, 1])
    .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib])
};

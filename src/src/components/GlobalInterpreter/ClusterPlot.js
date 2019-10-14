import * as d3 from 'd3';
import _ from 'lodash';

import { globalColors, lCom } from '../../GlobalStyles';

function ClusterPlot() {
  var width = 720, // default width
    height = 80; // default height

  let dataForWords = [];
  var xWordScale = '';

  function _clusterPlot(selection) {
    const words = dataForWords, // [ {'word': 'dog', 'count': 3}, {...}, ...]
      wordCounts = words.map(d => d.countTotal);

    console.log('cluster plot');

    _clusterPlot.dataForWords = function(xScale) {
      if (!arguments.length) return dataForWords;
      dataForWords = xScale;
      return _clusterPlot;
    };

    _clusterPlot.xWordScale = function(xScale) {
      if (!arguments.length) return xScale;
      xWordScale = xScale;
      return _clusterPlot;
    };
  }

  return _clusterPlot;
}

export default ClusterPlot;

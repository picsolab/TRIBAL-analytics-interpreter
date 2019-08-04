import React, { useEffect, useRef, useHover } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
  globalColors,
  SectionWrapper,
  SectionTitle,
  SubTitle
} from '../../GlobalStyles';

import data from '../../data/planets.json';
import { renderQueue } from '../../lib/renderQueue';

const FeaturePlotViewWrapper = styled(SectionWrapper).attrs({
  className: 'feature_plot_view_wrapper'
})`
  grid-area: f;
  height: 300px;
`;

function d3_functor(v) {
  return typeof v === 'function'
    ? v
    : function() {
        return v;
      };
}

const layout = {
  margin: { top: 20, right: 110, bottom: 20, left: 30 },
  width: 640,
  height: 240,
  leftMargin: 50,
  innerHeight: 340 - 2,
  featurePlot: {
    width: 350
  },
  clusterPlot: {
    width: 70,
    height: 240,
    leftMargin: 80,
    minRadius: 4,
    maxRadius: 8
  },
  pdpPlot: {
    width: 70,
    height: 240,
    leftMargin: 80
  }
};

const wholeWidth = layout.width + layout.margin.left + layout.margin.right,
  wholeHeight = layout.height + layout.margin.top + layout.margin.bottom;

const types = {
  Number: {
    key: 'Number',
    coerce: function(d) {
      return +d;
    },
    extent: d3.extent,
    within: function(d, extent, dim) {
      return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
    },
    defaultScale: d3.scaleLinear().range([layout.innerHeight, 0])
  },
  String: {
    key: 'String',
    coerce: String,
    extent: function(data) {
      return data.sort();
    },
    within: function(d, extent, dim) {
      return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
    },
    defaultScale: d3.scalePoint().range([0, layout.innerHeight])
  },
  Date: {
    key: 'Date',
    coerce: function(d) {
      return new Date(d);
    },
    extent: d3.extent,
    within: function(d, extent, dim) {
      return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
    },
    defaultScale: d3.scaleTime().range([layout.innerHeight, 0])
  }
};

const color = d3
  .scaleOrdinal()
  .domain([
    'Radial Velocity',
    'Imaging',
    'Eclipse Timing constiations',
    'Astrometry',
    'Microlensing',
    'Orbital Brightness Modulation',
    'Pulsar Timing',
    'Pulsation Timing constiations',
    'Transit',
    'Transit Timing constiations'
  ])
  .range([
    '#DB7F85',
    '#50AB84',
    '#4C6C86',
    '#C47DCB',
    '#B59248',
    '#DD6CA7',
    '#E15E5A',
    '#5DA5B3',
    '#725D82',
    '#54AF52',
    '#954D56',
    '#8C92E8',
    '#D8597D',
    '#AB9C27',
    '#D67D4B',
    '#D58323',
    '#BA89AD',
    '#357468',
    '#8F86C2',
    '#7D9E33',
    '#517C3F',
    '#9D5130',
    '#5E9ACF',
    '#776327',
    '#944F7E'
  ]);

const groupColorScale = d3
  .scaleOrdinal()
  .domain(['lib', 'con'])
  .range([globalColors.group.lib, globalColors.group.con]);

const dimensions = [
  {
    key: 'pl_discmethod',
    description: 'Discovery Method',
    type: types['String'],
    axis: d3.axisLeft().tickFormat(function(d, i) {
      return d;
    })
  },
  {
    key: 'pl_letter',
    description: 'Planet Letter',
    type: types['String']
  },
  {
    key: 'pl_pnum',
    description: 'Number of Planets in System',
    type: types['Number']
  },
  {
    key: 'pl_orbper',
    type: types['Number'],
    description: 'Planet Orbital Period',
    scale: d3.scaleLog().range([layout.innerHeight, 0])
  },
  {
    key: 'pl_orbsmax',
    type: types['Number'],
    description: 'Planet Semi-Major Axis',
    scale: d3.scaleLog().range([layout.innerHeight, 0])
  },
  {
    key: 'pl_orbeccen',
    description: 'Planet Eccentricity',
    type: types['Number']
  },
  {
    key: 'pl_orbincl',
    description: 'Planet Inclination',
    type: types['Number']
  },
  {
    key: 'pl_bmassj',
    description: 'Mass in Jupiters',
    type: types['Number']
  },
  {
    key: 'pl_rade',
    description: 'Planet Radius in Earth Radii',
    type: types['Number']
  },
  {
    key: 'pl_eqt',
    description: 'Planet Equilibrium Temperature (K)',
    type: types['Number']
  },
  {
    key: 'pl_imppar',
    description: 'Impact Parameter',
    type: types['Number']
  },
  {
    key: 'pl_trandep',
    description: 'Transit Depth (%)',
    type: types['Number']
  },
  {
    key: 'pl_trandur',
    description: 'Transit Duration (days)',
    type: types['Number']
  },
  {
    key: 'pl_ratror',
    description: 'Planet-Star Radius Ratio',
    type: types['Number']
  },
  {
    key: 'st_spstr',
    description: 'Star Spectral Type',
    type: types['String'],
    axis: d3.axisLeft().tickFormat(function(d, i) {
      if (i % 4) return;
      return d;
    })
  },
  {
    key: 'pl_locale',
    type: types['String'],
    axis: d3.axisLeft().tickFormat(function(d, i) {
      if (d == 'Multiple Locales') return 'Multiple';
      return d;
    })
  },
  {
    key: 'pl_disc',
    description: 'Year of Discovery',
    type: types['Date']
  },
  {
    key: 'pl_facility',
    description: 'Facility',
    type: types['String'],
    domain: [
      'Kepler',
      'La Silla Observatory',
      'K2',
      'W. M. Keck Observatory',
      'SuperWASP',
      'Multiple Observatories',
      'HATNet',
      'Haute-Provence Observatory',
      'Anglo-Australian Telescope',
      'OGLE',
      'Lick Observatory',
      'HATSouth',
      'CoRoT',
      'McDonald Observatory',
      'Okayama Astrophysical Observatory',
      'MOA',
      'Bohyunsan Optical Astronomical Observatory',
      'Las Campanas Observatory',
      'SuperWASP-South',
      'Roque de los Muchachos Observatory',
      'Paranal Observatory',
      'Gemini Observatory',
      'KELT',
      'Subaru Telescope',
      'Thueringer Landessternwarte Tautenburg',
      'XO',
      'Multiple Facilities',
      'Hubble Space Telescope',
      'Fred Lawrence Whipple Observatory',
      'TrES',
      'kepler',
      'KELT-South',
      'Spitzer Space Telescope',
      'Arecibo Observatory',
      'United Kingdom Infrared Telescope',
      'Large Binocular Telescope Observatory',
      'Xinglong Station',
      'Cerro Tololo Inter-American Observatory',
      'Palomar Observatory',
      'SuperWASP-North',
      'Qatar',
      'Teide Observatory',
      'European Southern Observatory',
      'Leoncito Astronomical Complex',
      'Infrared Survey Facility',
      'KMTNet',
      'Parkes Observatory',
      'Apache Point Observatory',
      'Oak Ridge Observatory',
      'MEarth Project',
      'Yunnan Astronomical Observatory',
      'Kitt Peak National Observatory'
    ],
    axis: d3.axisRight().tickFormat(function(d, i) {
      return d;
    })
  }
  /*
  {
    key: 'pl_telescope',
    description: 'Telescope',
    type: types['String'],
    axis: d3.axisRight()
      .tickFormat(function(d,i) {
        return d;
      })
  }
  */
  /*
  {
    key: 'pl_instrument',
    description: 'Instrument',
    type: types['String'],
    axis: d3.axisRight()
      .tickFormat(function(d,i) {
        return d;
      })
  }
  */
];

const FeaturePlotView = props => {
  const ref = useRef(null),
    ref2 = useRef(null);

  const {
      tweets,
      clusters,
      // clusterIdsForTweets,
      words,
      // pdpValues,
      selectedFeatures,
      isLoaded
    } = props,
    scoreFeatures = [
      { key: 'valence', abbr: 'V' },
      { key: 'arousal', abbr: 'A' },
      { key: 'dominance', abbr: 'D' },
      { key: 'moral1', abbr: 'M1' },
      { key: 'moral2', abbr: 'M2' },
      { key: 'moral3', abbr: 'M3' }
    ];

  useEffect(() => {
    console.log('in featureplotview useeffect: ', isLoaded);
    console.log('in featureplotview useeffect: ', clusters);
    console.log('in featureplotview useeffect: ', tweets);
    const xFeatureScale = d3
      .scalePoint()
      .domain(selectedFeatures)
      .range([layout.margin.left, layout.featurePlot.width]);

    const yScoreScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([layout.height, layout.margin.top]);

    const yAxis = d3.axisLeft();

    const container = d3.select(ref.current);
    const svg = d3.select(ref2.current);

    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvas = container
      .append('canvas')
      .attr('class', 'canvas_tweet_paths')
      .attr('width', layout.width * devicePixelRatio)
      .attr('height', layout.height * devicePixelRatio)
      .style('width', layout.width + 'px')
      .style('height', layout.height + 'px')
      .style('z-index', -1);

    const ctx = canvas.node().getContext('2d');
    ctx.globalCompositeOperation = 'darken';
    ctx.globalAlpha = 1;
    ctx.lineWidth = 0.7;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    //* Render the feature plot
    const gFeaturePlot = svg.append('g').attr('class', 'g_feature_plot');

    const axes = gFeaturePlot
      .selectAll('.axis')
      .data(scoreFeatures)
      .enter()
      .append('g')
      .attr('class', function(d) {
        return 'axis ';
      })
      .attr('transform', function(d, i) {
        return 'translate(' + xFeatureScale(d.key) + ')';
      });

    const featureTitle = svg
      .selectAll('text')
      .data(scoreFeatures)
      .enter()
      .append('text')
      .text(d => d.abbr)
      .attr('x', (d, i) => xFeatureScale(d.key) - 10)
      .attr('y', (d, i) => layout.margin.top - 10)
      .style('font-size', '0.8rem');

    const render = renderQueue(draw).rate(30);

    ctx.clearRect(0, 0, layout.width, layout.height);
    ctx.globalAlpha = d3.min([1.15 / Math.pow(tweets.length, 0.3), 1]);
    render(tweets);

    axes
      .append('g')
      .each(function(d) {
        const yAxisSetting = d3
          .axisLeft(yScoreScale)
          .tickValues(d3.range(0, 1.1, 0.2))
          .tickSize(1);
        d3.select(this).call(yAxisSetting);
      })
      .append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'start');

    // Add and store a brush for each axis.
    axes
      .append('g')
      .attr('class', 'brush')
      .each(function(d) {
        d3.select(this).call(
          (d.brush = d3
            .brushY()
            .extent([[-10, 0], [10, layout.height]])
            .on('start', brushstart)
            .on('brush', brush)
            .on('end', brush))
        );
      })
      .selectAll('rect')
      .attr('x', -8)
      .attr('width', 16);

    d3.selectAll('.axis.pl_discmethod .tick text').style('fill', color);

    // For feature plots
    function project(d) {
      console.log('d in project: ', d);
      return scoreFeatures.map(function(p, i) {
        // check if data element has property and contains a value
        if (!(p.key in d) || d[p.key] === null) return null;

        return [xFeatureScale(p.key), yScoreScale(d[p.key])];
      });
    }

    function draw(d) {
      console.log('d in draw: ', d);
      ctx.strokeStyle = groupColorScale(d.group);
      ctx.beginPath();
      const coords = project(d);
      coords.forEach(function(p, i) {
        // this tricky bit avoids rendering null values as 0
        if (p === null) {
          // this bit renders horizontal lines on the previous/next
          // dimensions, so that sandwiched null values are visible
          if (i > 0) {
            const prev = coords[i - 1];
            if (prev !== null) {
              ctx.moveTo(prev[0], prev[1]);
              ctx.lineTo(prev[0] + 6, prev[1]);
            }
          }
          if (i < coords.length - 1) {
            const next = coords[i + 1];
            if (next !== null) {
              ctx.moveTo(next[0] - 6, next[1]);
            }
          }
          return;
        }

        if (i == 0) {
          ctx.moveTo(p[0], p[1]);
          return;
        }

        ctx.lineTo(p[0], p[1]);
      });
      ctx.stroke();
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      render.invalidate();

      const actives = [];
      svg
        .selectAll('.axis .brush')
        .filter(function(d) {
          return d3.brushSelection(this);
        })
        .each(function(d) {
          actives.push({
            dimension: d,
            extent: d3.brushSelection(this)
          });
        });

      const selected = tweets.filter(function(d) {
        if (
          actives.every(function(active) {
            const dim = active.dimension;
            // test if point is within extents for each active brush
            return dim.type.within(d[dim.key], active.extent, dim);
          })
        ) {
          return true;
        }
      });

      // show ticks for active brush dimensions
      // and filter ticks to only those within brush extents
      /*
      svg.selectAll('.axis')
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? true : false;
          })
          .classed('active', true)
          .each(function(dimension, i) {
            const extent = extents[i];
            d3.select(this)
              .selectAll('.tick text')
              .style('display', function(d) {
                const value = dimension.type.coerce(d);
                return dimension.type.within(value, extent, dimension) ? null : 'none';
              });
          });

      // reset dimensions without active brushes
      svg.selectAll('.axis')
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? false : true;
          })
          .classed('active', false)
          .selectAll('.tick text')
            .style('display', null);
      */

      ctx.clearRect(0, 0, layout.width, layout.height);
      ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1]);
      render(selected);
    } // end of brush()

    //* Render clusters
    const gClusterPlot = svg
      .append('g')
      .attr('class', 'g_cluster_plot')
      .attr(
        'transform',
        'translate(' +
          (layout.featurePlot.width +
            layout.clusterPlot.leftMargin +
            layout.clusterPlot.maxRadius * 2) +
          ',0)'
      );

    const yClusterCoordScale = d3
      .scaleBand()
      .domain(clusters.map(d => d.clusterId))
      .range([layout.margin.top, layout.clusterPlot.height]);

    const numTweetClusterScale = d3
      .scaleLinear()
      .domain(clusters.map(d => d.numTweets))
      .range([layout.clusterPlot.minRadius, layout.clusterPlot.maxRadius]);

    const groupRatioScale = d3
      .scaleLinear()
      .domain([0, 0.5, 1])
      .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib]);

    const yClusterAxisSetting = d3
        .axisLeft(yClusterCoordScale)
        .tickValues([])
        .tickSize(0),
      yClusterAxis = gClusterPlot
        .append('g')
        .call(yClusterAxisSetting)
        .attr('class', 'g_cluster_y_axis')
        .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

    const drawTweetLine = d3
      .line()
      .x(d => {
        console.log('d: ', d);
        console.log('d: ', xFeatureScale(d[0]));
        return xFeatureScale(d[0]);
      })
      .y(d => yScoreScale(d[1]));

    const clusterCircles = gClusterPlot
      .selectAll('.cluster_circle')
      .data(clusters)
      .enter()
      .append('circle')
      .attr('cx', 0)
      .attr('cy', d => yClusterCoordScale(d.clusterId))
      .attr('r', d => numTweetClusterScale(d.numTweets))
      .style('fill', d => groupRatioScale(d.groupRatio.lib))
      .style('fill-opacity', 0.5)
      .style('stroke', d => d3.rgb(groupRatioScale(d.groupRatio.lib)).darker())
      .on('mouseover', d => {
        const clusterId = d.clusterId,
          tweetsInCluster = tweets.filter(e => e.clusterId === clusterId);

        console.log('mouseovered');
        console.log(d);
        console.log(tweets);
        console.log(tweetsInCluster);

        const tweetsPathData = tweetsInCluster.map(d => {
          const tweetWithSelectedFeatures = _.pick(d, selectedFeatures);

          return Object.entries(tweetWithSelectedFeatures);
        });

        console.log(tweetsPathData);

        gFeaturePlot
          .selectAll('.path_tweet')
          .data(tweetsPathData)
          .enter()
          .append('path')
          .attr('class', 'path_tweet')
          .attr('d', drawTweetLine)
          .style('stroke', 'black')
          .style('fill', 'none')
          .style('stroke-width', '2px')
          .style('stroke-dasharray', '3,1');

        // tweetsInCluster.forEach((tweet) => {
        //   gClusterPlot.append('path')
        //     .datum(tweetsInCluster)
        //     .attr('d', drawTweetLine)
        //     .style('stroke', precisionKPlotColor)
        //     .style('fill', 'none')
        //     .style('stroke-width', '2px')
        //     .style('stroke-dasharray', '3,1');
        // });

        // fittedPrecisionKPathForTopk = gTopkRanking.append('path')
        //   .datum(precisionKData.slice(0, topk))
        //   .attr('d', drawTweetLine)
        //   .style('stroke', precisionKPlotColor)
        //   .style('fill', 'none')
        //   .style('stroke-width', '2px')
        //   .style('stroke-dasharray', '3,1'),
      })
      .on('mouseout', d => {
        gFeaturePlot.selectAll('.path_tweet').remove();
      });

    function drawPath() {}

    const clusterTitle = gClusterPlot
      .append('text')
      .text('Cluster')
      .attr('y', 10);

    //* Render Partial dependent plot (PDP)
    const gPDP = svg
      .append('g')
      .attr('class', 'g_pdp')
      .attr(
        'transform',
        'translate(' +
          (layout.featurePlot.width +
            layout.clusterPlot.width +
            layout.clusterPlot.maxRadius * 2 +
            layout.pdpPlot.leftMargin) +
          ',0)'
      );

    const yClusterCoordPDPScale = d3
      .scaleBand()
      .domain(clusters.map(d => d.clusterId))
      .range([layout.margin.top, layout.pdpPlot.height]);

    const xPDPScale = d3
      .scaleLinear()
      .domain(clusters.map(d => d.pdpValue))
      .range([0, layout.pdpPlot.width]);

    const colorPDPScale = d3
      .scaleLinear()
      .domain([0, 0.5, 1]) // 0 (prob of being con) --- >>> --- 1 (prob of being lib)
      .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib]);

    const yPDPAxisSetting = d3.axisLeft(yClusterCoordPDPScale).tickSize(0),
      yPDPAxis = gPDP
        .append('g')
        .call(yPDPAxisSetting)
        .attr('class', 'g_pdp_y_axis')
        .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

    const pdpBars = gPDP
      .selectAll('.cluster_circle')
      .data(clusters)
      .enter()
      .append('rect')
      .attr('class', 'cluster_circle')
      .attr('x', 0)
      .attr('y', d => yClusterCoordPDPScale(d.clusterId))
      .attr('width', d => xPDPScale(d.pdpValue))
      .attr('height', yClusterCoordPDPScale.bandwidth() - 3)
      .style('fill', d => colorPDPScale(d.pdpValue))
      .style('fill-opacity', 0.5);

    const pdpTitle = gPDP
      .append('text')
      .text('PDP')
      .attr('y', 10);
  }, [props, ref.current]);

  d3.selectAll('canvas').remove();

  return (
    <FeaturePlotViewWrapper
      ref={ref}
      width={wholeWidth}
      height={wholeHeight}
      // style={{ display: 'flex' }}
    >
      <svg
        // width={layout.width + layout.margin.left + layout.margin.right}
        // height={layout.height + layout.margin.top + layout.margin.bottom}
        width="100%"
        height="100%"
        viewBox={'0 0 ' + wholeWidth + ' ' + wholeHeight}
        preserveAspectRatio="xMinYMin"
        ref={ref2}
      />
    </FeaturePlotViewWrapper>
  );
};

export default FeaturePlotView;

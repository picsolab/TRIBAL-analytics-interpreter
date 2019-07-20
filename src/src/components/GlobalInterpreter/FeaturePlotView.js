import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import data from '../../data/planets.json';
import { renderQueue } from '../../lib/renderQueue';

const FeaturePlotViewWrapper = styled(SectionWrapper).attrs({
  className: 'feature_plot_view_wrapper'
})`
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
  width: 400,
  height: 200,
  innerHeight: 340 - 2
};

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
  .domain(['con', 'lib'])
  .range(['pink', 'skyblue']);

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
    key: "pl_telescope",
    description: "Telescope",
    type: types["String"],
    axis: d3.axisRight()
      .tickFormat(function(d,i) {
        return d;
      })
  }
  */
  /*
  {
    key: "pl_instrument",
    description: "Instrument",
    type: types["String"],
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

  const { tweets } = props,
    scoreFeatures = [
      { key: 'valence', abbr: 'V' },
      { key: 'arousal', abbr: 'A' },
      { key: 'dominance', abbr: 'D' },
      { key: 'moral1', abbr: 'M1' },
      { key: 'moral2', abbr: 'M2' },
      { key: 'moral3', abbr: 'M3' }
    ];

  useEffect(() => {
    const xFeatureScale = d3
      .scalePoint()
      .domain(d3.range(scoreFeatures.length))
      .range([layout.margin.left, layout.width]);

    const yScoreScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([layout.height, layout.margin.top]);

    const yAxis = d3.axisLeft();

    const container = d3.select(ref.current);
    const svg = d3.select(ref2.current);

    const canvas = container
      .append('canvas')
      .attr('width', layout.width)
      .attr('height', layout.height)
      .style('width', layout.width + 'px')
      .style('height', layout.height + 'px');

    const ctx = canvas.node().getContext('2d');
    ctx.globalCompositeOperation = 'darken';
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1.5;

    const axes = svg
      .selectAll('.axis')
      .data(scoreFeatures)
      .enter()
      .append('g')
      .attr('class', function(d) {
        return 'axis ';
      })
      .attr('transform', function(d, i) {
        return 'translate(' + xFeatureScale(i) + ')';
      });

    const featureTitle = svg
      .selectAll('text')
      .data(scoreFeatures.map(d => d.abbr))
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => xFeatureScale(i) - 10)
      .attr('y', (d, i) => layout.margin.top - 10)
      .style('font-size', '0.8rem');

    const render = renderQueue(draw).rate(30);

    ctx.clearRect(0, 0, layout.width, layout.height);
    ctx.globalAlpha = d3.min([1.15 / Math.pow(tweets.length, 0.3), 1]);
    render(tweets);

    axes
      .append('g')
      .each(function(d) {
        // const renderAxis =
        //   'axis' in d
        //     ? d.axis.scale(d.scale) // custom axis
        //     : yAxis.scale(d.scale); // default axis
        const yAxisSetting = d3
          .axisLeft(yScoreScale)
          .tickValues(d3.range(0, 1.1, 0.2));
        d3.select(this).call(yAxisSetting);
      })
      .append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'start');
    // .text(function(d) {
    //   return 'description' in d ? d.description : d.key;
    // });

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

    function project(d) {
      return scoreFeatures.map(function(p, i) {
        // check if data element has property and contains a value
        if (!(p.key in d) || d[p.key] === null) return null;

        return [xFeatureScale(i), yScoreScale(d[p.key])];
      });
    }

    function draw(d) {
      ctx.strokeStyle = groupColorScale(d.grp);
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
      svg.selectAll(".axis")
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? true : false;
          })
          .classed("active", true)
          .each(function(dimension, i) {
            const extent = extents[i];
            d3.select(this)
              .selectAll(".tick text")
              .style("display", function(d) {
                const value = dimension.type.coerce(d);
                return dimension.type.within(value, extent, dimension) ? null : "none";
              });
          });

      // reset dimensions without active brushes
      svg.selectAll(".axis")
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? false : true;
          })
          .classed("active", false)
          .selectAll(".tick text")
            .style("display", null);
      */

      ctx.clearRect(0, 0, layout.width, layout.height);
      ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1]);
      render(selected);
    }
  }, [props, ref.current]);

  console.log('canvas: ', d3.selectAll('canvas'));
  d3.selectAll('canvas').remove();

  return (
    <FeaturePlotViewWrapper
      ref={ref}
      width={layout.width + layout.margin.left + layout.margin.right}
      height={layout.height + layout.margin.top + layout.margin.bottom}
    >
      <svg
        width={layout.width + layout.margin.left + layout.margin.right}
        height={layout.height + layout.margin.top + layout.margin.bottom}
        ref={ref2}
        style={{ position: 'absolute' }}
      />
    </FeaturePlotViewWrapper>
  );
};

export default FeaturePlotView;

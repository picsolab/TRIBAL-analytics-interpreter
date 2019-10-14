import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

export const globalColors = {
  system: 'mediumpurple',
  group: {
    lib: 'darkblue',
    con: 'crimson',
    wrong: {
      lib: 'rosybrown',
      con: '#8eabd0'
    }
  },
  groups: [
    { name: 'lib', color: 'rgb(25, 12, 226)', colorForWrong: '#8eabd0' },
    { name: 'con', color: 'rgb(255, 34, 34)', colorForWrong: 'rosybrown' }
  ],
  feature: '#00ffa8',
  userFeature: 'LIGHTSEAGREEN'
};

/* (y,x) coordinate of top-left position
--------  hIndicator --- hPlot ---  outputPlot -- clusterPlot --
level1 | (0.00, 0.00) (0.00, 0.10) ------------ (0.00, 0.75)
level2 | (0.15, 0.00) (0.15, 0.10) (0.15, 0.70) (0.15, 0.75)
level3 | (0.85, 0.00) (0.85, 0.10) (0.85, 0.70) (0.85, 0.75)
*/

export const l = {
  w: 1100,
  h: 450,
  sm: 10,
  mm: 10,
  lm: 15,
  textHeight: 10,
  textHeight2: 15
};

export const ll = {
  l1: {
    t: 5,
    h: l.h * 0.1,
    l: 5
  },
  l1ToL2: {
    t: l.h * 0.1,
    h: l.h * 0.1
  },
  l2: {
    t: l.h * 0.2,
    h: l.h * 0.4
  },
  l2ToL3: {
    t: l.h * 0.6,
    h: l.h * 0.1
  },
  l3: {
    t: l.h * 0.7,
    h: l.h * 0.3
  }
};

export const lCom = {
  hIndicator: {
    // div
    t: 0,
    l: 5,
    w: 70,
    h: l.h * 0.9,
    textHeight: 10
  },
  hPlot: {
    // in the context of svg
    t: 0,
    l: 25,
    w: l.w * 0.45,
    h: l.h * 0.9,
    goalPlot: {
      t: ll.l1.t,
      h: ll.l1.h,
      m: 20,
      goalRect: {
        t: ll.l1.t + 10,
        h: 5
      },
      goalTitle: {
        t: ll.l1.t,
        textHeight: 8
      }
    },
    featurePlotTitles: {
      t: ll.l2.t - 30,
      h: ll.l2.h
    },
    featurePlot: {
      t: ll.l2.t,
      h: ll.l2.h,
      titles: {
        t: ll.l2.t - 15,
        h: ll.l2.h - 15,
        m: 15
      },
      axis: {
        w: 30,
        h: ll.l2.h,
        m: 10
      },
      pdp: {
        w: 20
      }
    },
    wordPlot: {
      t: ll.l2.t,
      h: ll.l2.h,
      word: {
        w: 20,
        maxH: 10
      }
    }
  },
  fromFtoO: {
    l: l.w * 0.48,
    w: l.w * 0.05
  },
  outputProbPlot: {
    t: ll.l2.t,
    h: ll.l2.h,
    l: l.w * 0.54,
    w: 80
  },
  clusterPlot: {
    t: l.h * 0.15,
    h: ll.l1.h + ll.l2.h,
    l: l.w * 0.625,
    w: l.w * 0.325,
    m: 10,
    minR: 4,
    maxR: 15
  },
  pdpPlot: {
    t: ll.l2.t,
    h: ll.l2.h,
    l: l.w * 0.75,
    w: l.w * 0.1
  }
};

export const SectionWrapper = styled.div`
  padding: 10px;
  // margin: 5px;
  margin-top: 15px;
`;

export const SectionTitle = styled.div`
  display: inline-block;
  padding: 5px;
  margin: 3px;
  // border-bottom: 4px solid gray;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  font-weight: bold;
`;

export const SubsectionTitle = styled.div.attrs({
  className: 'subsection_title'
})`
  display: inline-block;
  font-weight: 550;
  // border-bottom: 2px solid gray;
  padding-bottom: 2px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: gray;
`;

export const SubTitle = styled.div`
  font-weight: 500;
`;

export const SubTitle2 = styled.div`
  margin: 0 10px;
  // text-align: center;
`;

export const ComponentSubTitle = styled(SubTitle)`
  padding: 3px 0;
  // background-color: whitesmoke;
  // border: 0.5px solid black;
  // text-align: center;
`;

export const ListViewStyle = styled.div`
  height: 70%;
  padding: 3px 7px;
  background-color: whitesmoke;
`;

export const Button1 = styled(Button)`
  background: mediumpurple;
  border: none;
  padding: 1px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  height: 25px;
  border-radius: 3px;
  margin-top: 15px;
  // margin-left: 5px;
`;

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import index from '../index.css';
import {
  globalColors,
  SectionTitle,
  SubTitle,
  SubsectionTitle,
  SectionWrapper
} from '../GlobalStyles';

const layout = {
  margin: { top: 20, right: 20, bottom: 20, left: 30 },
  width: 300,
  height: 200,
  leftMargin: 30,
  innerHeight: 340 - 2,
  featureGroupPlot: {
    width: 300,
    height: 150,
    leftMargin: 30,
    groupPlot: {
      width: 90,
      height: 150,
      leftMargin: 30
    },
    diffPlot: {
      width: 120,
      height: 150,
      leftMargin: 30
    }
  }
};

const ResultViewWrapper = styled(SectionWrapper)`
  grid-area: r;
  background-color: whitesmoke;
  padding: 10px;
  margin: 0 10px;
`;

const OutputInstance = ({ model, idx }) => {
  return (
    <div style={{ display: 'flex', fontWeight: 600, marginBottom: '5px' }}>
      <div style={{ height: '20px', marginRight: '5px' }}>{idx + 1}</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <div>{'VFDC'}</div>
        <div>{'mode-' + model.mode}</div>
        <div>{Math.ceil(model.performance * 10000) / 100 + '%'}</div>
      </div>
      {/* <div>{'Output prob plot...'}</div> */}
    </div>
  );
};

const ResultView = ({ models }) => {
  return (
    <ResultViewWrapper>
      <SubsectionTitle>Models</SubsectionTitle>
      {models.map((model, idx) => (
        <OutputInstance model={model} idx={idx} />
      ))}
    </ResultViewWrapper>
  );
};

export default ResultView;

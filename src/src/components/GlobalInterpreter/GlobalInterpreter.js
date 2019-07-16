import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';
import FeaturePlotView from './FeaturePlotView';

const GlobalInterpreterWrapper = styled(SectionWrapper).attrs({
  className: 'GlobalInterpreter'
})`
  grid-area: g;
  border-left: 1px solid darkgray;
`;

const GlobalInterpreter = ({ data }) => {
  return (
    <GlobalInterpreterWrapper>
      <div style={{ display: 'flex' }}>
        <SectionTitle>Global Interpretability</SectionTitle>
      </div>
      <FeaturePlotView />
    </GlobalInterpreterWrapper>
  );
};

export default GlobalInterpreter;

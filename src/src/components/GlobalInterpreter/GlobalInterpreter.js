import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';
import FeaturePlotView from './FeaturePlotView';

const GlobalInterpreterWrapper = styled.div.attrs({
  className: 'global_interpreter'
})`
  grid-area: g;
`;

const GlobalInterpreter = ({ tweets }) => {
  return (
    <GlobalInterpreterWrapper>
      <div style={{ display: 'flex' }}>
        <SectionTitle>Global Interpretability</SectionTitle>
      </div>
      <FeaturePlotView tweets={tweets} />
    </GlobalInterpreterWrapper>
  );
};

export default GlobalInterpreter;

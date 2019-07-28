import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import Generator from './Generator';
import AbstrctFeaturePlotView from './AbstractFeaturePlotView';
import FeaturePlotView from './FeaturePlotView';
import WordPlotView from './WordPlotView';

const GlobalInterpreterWrapper = styled.div.attrs({
  className: 'global_interpreter'
})`
  grid-area: g;
  display: grid;
  grid-template-columns: 15% 85%;
  grid-template-rows: 50px 50px 300px 100px;
  grid-template-areas:
    't t'
    'ge ab'
    'ge f'
    'ge w';
`;

const GlobalInterpreter = ({ tweets, clusters, words }) => {
  const numFeatures = 6,
    numAbstractFeatures = 1;

  return (
    <GlobalInterpreterWrapper>
      <div style={{ gridArea: 't' }}>
        <SectionTitle>Global Interpretability</SectionTitle>
      </div>
      <Generator tweets={tweets} />
      <AbstrctFeaturePlotView numAbstractFeatures={numAbstractFeatures} />
      <FeaturePlotView
        numFeatures={numFeatures}
        tweets={tweets}
        clusters={clusters}
      />
      <WordPlotView numFeatures={numFeatures} words={words} />
    </GlobalInterpreterWrapper>
  );
};

export default GlobalInterpreter;

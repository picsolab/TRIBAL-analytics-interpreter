import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import { runDT } from '../../modules/dataLoader';
import { calculatePartialDependence } from '../../modules/globalInterpreter';

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
  grid-template-rows: 50px 5px 300px 100px;
  grid-template-areas:
    't t'
    'ge ab'
    'ge f'
    'ge w';
`;

const GlobalInterpreter = ({
  currentModel,
  selectedFeatures,
  tweets,
  clusters,
  words
}) => {
  const dispatch = useDispatch();

  const numFeatures = 6,
    numAbstractFeatures = 1;

  useEffect(() => {
    console.log('tweets in useEffect: ', tweets);
    dispatch(runDT({ tweets: tweets, selectedFeatures: selectedFeatures }));
    dispatch(
      calculatePartialDependence({
        modelId: currentModel,
        tweets: tweets,
        features: selectedFeatures
      })
    );
  }, [currentModel]);

  return (
    <GlobalInterpreterWrapper>
      <div style={{ gridArea: 't' }}>
        <SectionTitle>Global Interpretability</SectionTitle>
      </div>
      <Generator tweets={tweets} selectedFeatures={selectedFeatures} />
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

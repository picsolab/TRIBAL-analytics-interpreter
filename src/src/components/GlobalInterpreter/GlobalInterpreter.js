import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Grommet, Button, Select } from 'grommet';
import { grommet } from 'grommet/themes';
import { deepMerge } from 'grommet/utils';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
  globalColors,
  SectionWrapper,
  SectionTitle,
  SubsectionTitle,
  SubTitle
} from '../../GlobalStyles';

import { runDT, runDTThenRunClandPD } from '../../modules/tweet';
import {
  runClustering,
  runClusteringAndPartialDependenceForClusters
} from '../../modules/cluster';
import { calculatePartialDependence } from '../../modules/globalInterpreter';

import Generator from './Generator';
import AbstrctFeaturePlotView from './AbstractFeaturePlotView';
import FeaturePlotView from './FeaturePlotView';
import WordPlotView from './WordPlotView';

const GlobalInterpreterWrapper = styled(SectionWrapper).attrs({
  className: 'global_interpreter'
})`
  grid-area: g;
  display: grid;
  grid-template-columns: 20% 80%;
  grid-template-rows: 50px 50px 20px 300px 150px;
  grid-template-areas:
    'ge t'
    'ge md'
    'ge ab'
    'ge f'
    'ge w';
`;

const ModeViewWrapper = styled.div.attrs({
  className: 'mode_view_wrapper'
})`
  grid-area: md;
  display: flex;
  align-items: center;
  border: 1px solid #dadada;
  background-color: whitesmoke;
  padding: 4px;
`;

const ModeDropdown = styled(Select).attrs({
  className: 'mode_dropdown'
})`
  width: 80%;
  height: 35px;
  background-color: white;
  border: 1px solid whitesmoke;
  border-radius: 10px;
`;

const IndicatorTitle = styled.div.attrs({
  className: 'data_indicator_title'
})`
  height: 15px;
  background-color: mediumaquamarine;
  color: black;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
  line-height: 0.7;
  font-size: 0.6rem;
  margin: 2px 0;
`;

const QuestionIndicatorTitle = styled(IndicatorTitle).attrs({
  className: 'data_indicator_title'
})`
  width: 55px;
`;

const FeatureIndicator = styled.span.attrs({
  className: 'data_indicator'
})`
  height: 15px;
  background-color: black;
  color: white;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
  line-height: 0.5;
`;

const TargetIndicator = styled.span.attrs({
  className: 'target_indicator'
})`
  height: 15px;
  background-color: black;
  color: white;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
  line-height: 0.5;
`;

const QuestionDiv = styled.span.attrs({
  className: 'question_wrapper'
})`
  height: 20px;
  background-color: rgb(190, 255, 231);
  color: black;
  font-weight: 600;
  padding: 4px 6px;
  margin-bottom: 2px;
  border-radius: 3px;
`;

const globalModes = [
  {
    type: 1,
    feature: 'True',
    target: 'True',
    question:
      'Are groups predictable by their tendency in expressing emotion and moral values?',
    display: ''
  },
  {
    type: 2,
    feature: 'True',
    target: 'Predicted',
    question: 'How well can (shallow) machine predict ideological groups?',
    display: ''
  },
  {
    type: 3,
    feature: 'Predicted',
    target: 'Predicted',
    question:
      'How well can construct values be predicted by (shallow) machine?',
    display: ''
  },
  {
    type: 4,
    feature: 'Predicted',
    target: 'Predicted',
    question:
      'How well can groups be predicted by DL machine with low-level and theory-informed features?',
    display: ''
  }
];

const customDropdownTheme = {
  global: {
    font: {
      size: '0.7rem'
    },
    extend: `
      width: 70%;
    `
  },
  select: {
    container: {
      extend: `
      width: 100%;
    `
    }
  },
  options: {
    text: {
      fontSize: '0.7rem'
    }
  }

  // dropdown: {
  //   // size: '18px',
  //   // // toggle: {
  //   // //   extend: `
  //   // //   font-size: 0.9rem;
  //   // //   margin-right: 3px;
  //   // // `
  //   // // },
  //   // icon: {
  //   //   size: '15px'
  //   // },
  //   // border: {
  //   //   width: '1px',
  //   //   extend: `
  //   //   font-size: 0.9rem;
  //   //   margin-right: 3px;
  //   // `
  //   // },
  //   // gap: 'xsmall',
  //   extend: `
  //     font-size: 0.9rem;
  //     // margin-right: 3px;
  //   `
  // }
};

const globalModesWithDisplay = globalModes.map(d => ({
  ...d,
  display: (
    <div style={{ padding: '5px', margin: '5px' }}>
      <div
        style={{
          display: 'flex',
          height: '30px',
          alignItems: 'center',
          fontSize: '0.7rem'
        }}
      >
        <div>
          <IndicatorTitle>Features</IndicatorTitle>
          <FeatureIndicator>{d.feature}</FeatureIndicator>
        </div>
        &nbsp;
        <span>{'-'}</span>
        &nbsp;
        <div>
          <IndicatorTitle>target</IndicatorTitle>
          <TargetIndicator>{d.target}</TargetIndicator>
        </div>
        &nbsp;&nbsp;&nbsp;
        <div>
          <QuestionIndicatorTitle>Question</QuestionIndicatorTitle>
          <QuestionDiv>{d.question}</QuestionDiv>
        </div>
      </div>
    </div>
  )
}));

const GlobalInterpreter = props => {
  const dispatch = useDispatch();
  const {
    globalMode,
    currentModel,
    features,
    selectedFeatures,
    tweets,
    tweetsWithPredFeatures,
    clusters,
    clusterIdsForTweets,
    words,
    pdpValues,
    pdpValuesForCon,
    pdpValuesForLib,
    isLoaded
  } = props;
  const numFeatures = 6,
    numAbstractFeatures = 1;

  useEffect(() => {
    dispatch(
      runDTThenRunClandPD({
        tweets: tweets,
        selectedFeatures: selectedFeatures,
        modelId: currentModel
      })
    );
  }, []);

  if (!clusters || clusters.length === 0 || isLoaded === false) return <div />;

  return (
    <GlobalInterpreterWrapper>
      <div style={{ gridArea: 't' }}>
        <SectionTitle>Global Interpretability</SectionTitle>
      </div>
      <div style={{ gridArea: 'md', display: 'flex', alignItems: 'center' }}>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <SubsectionTitle>Mode: </SubsectionTitle>
        &nbsp;&nbsp;&nbsp;
        <Grommet theme={deepMerge(grommet, customDropdownTheme)}>
          <ModeDropdown
            multiple={false}
            value={globalModesWithDisplay[globalMode].display}
            onChange={(e, i) => {
              const selectedGlobalMode = e.selected;
              dispatch({
                type: 'CHANGE_GLOBAL_MODE',
                payload: selectedGlobalMode
              });

              if (globalMode !== selectedGlobalMode) {
                selectedGlobalMode === 2
                  ? dispatch(
                      runDTThenRunClandPD({
                        tweets: tweets,
                        selectedFeatures: selectedFeatures,
                        modelId: currentModel
                      })
                    )
                  : console.log('no');
              }
            }}
            options={globalModesWithDisplay.map(d => d.display)}
            size={'small'}
          />
        </Grommet>
        {/* <QuestionDiv>
          {'How well can (shallow) machine predict ideological groups?'}
        </QuestionDiv> */}
      </div>
      <Generator
        globalMode={globalMode}
        tweets={tweets}
        tweetsWithPredFeatures={tweetsWithPredFeatures}
        features={features}
        selectedFeatures={selectedFeatures}
      />
      <AbstrctFeaturePlotView
        numAbstractFeatures={numAbstractFeatures}
        globalMode={globalMode}
      />
      <FeaturePlotView
        globalMode={globalMode}
        numFeatures={numFeatures}
        tweets={tweets}
        selectedFeatures={selectedFeatures}
        clusters={clusters}
        // clusterIdsForTweets={clusterIdsForTweets}
        pdpValues={pdpValues}
        pdpValuesForCon={pdpValuesForCon}
        pdpValuesForLib={pdpValuesForLib}
        isLoaded={isLoaded}
      />
      <WordPlotView
        globalMode={globalMode}
        numFeatures={numFeatures}
        words={words}
        selectedFeatures={selectedFeatures}
      />
    </GlobalInterpreterWrapper>
  );
};

export default GlobalInterpreter;

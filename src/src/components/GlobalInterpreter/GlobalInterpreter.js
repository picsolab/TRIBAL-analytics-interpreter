import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button, Select } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
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
  grid-template-columns: 15% 85%;
  grid-template-rows: 50px 50px 20px 300px 150px;
  grid-template-areas:
    't t'
    'md md'
    'ge ab'
    'ge f'
    'ge w';
`;

const ModeViewWrapper = styled.div.attrs({
  className: 'mode_view_wrapper'
})`
  grid-area: md;
  border: 1px solid #dadada;
  background-color: whitesmoke;
  padding: 4px;
`;

const ModeDropdown = styled(Select).attrs({
  className: 'mode_dropdown'
})`
  width: 80%;
  height: 30px;
  background-color: white;
  border: 1px solid whitesmoke;
  border-radius: 10px;
`;

const FeatureIndicator = styled.div.attrs({
  className: 'data_indicator'
})`
  height: 20px;
  background-color: black;
  color: white;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
`;

const TargetIndicator = styled.div.attrs({
  className: 'target_indicator'
})`
  height: 20px;
  background-color: black;
  color: white;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
`;

const QuestionDiv = styled.div.attrs({
  className: 'question_wrapper'
})`
  height: 20px;
  background-color: gray;
  color: white;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
`;

const globalModes = [
  {
    type: 1,
    question:
      'Are groups predictable by their tendency in expressing emotion and moral values?',
    display: ''
  },
  {
    type: 2,
    question: 'How well can (shallow) machine predict ideological groups?',
    display: ''
  },
  {
    type: 3,
    question: 'How well can (shallow) machine predict ideological groups?',
    display: ''
  },
  {
    type: 4,
    question: 'How well can (shallow) machine predict ideological groups?',
    display: ''
  }
];

const globalModesWithDisplay = globalModes.map(d => ({
  ...d,
  display: (
    <div style={{ padding: '5px' }}>
      <div style={{ display: 'flex', height: '30px', alignItems: 'center' }}>
        <FeatureIndicator>{'TRUE'}</FeatureIndicator>
        &nbsp;
        <span>{'-'}</span>
        &nbsp;
        <TargetIndicator>{'TRUE'}</TargetIndicator>
        &nbsp;&nbsp;&nbsp;
        <QuestionDiv>{d.question}</QuestionDiv>
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
    isLoaded
  } = props;
  const numFeatures = 6,
    numAbstractFeatures = 1;

  useEffect(() => {
    // dispatch(runClustering());
    // dispatch(
    //   runDT({
    //     tweets: tweets,
    //     selectedFeatures: selectedFeatures
    //   })
    // );
    // dispatch(
    //   calculatePartialDependence({
    //     modelId: currentModel,
    //     tweets: tweets,
    //     features: selectedFeatures
    //   })
    // );
    // const stateReturns = dispatch(runClustering());
    // console.log('stateReturns: ', stateReturns);
    // dispatch(runDT({ tweets: tweets, selectedFeatures: selectedFeatures }));
    // dispatch(
    //   calculatePartialDependence({
    //     modelId: currentModel,
    //     tweets: tweets,
    //     features: selectedFeatures
    //   })
    // );

    // console.log('in globalinterpreter useeffect: ', tweets);
    // dispatch(runDT({ tweets: tweets, selectedFeatures: selectedFeatures }));
    // dispatch(
    //   runClusteringAndPartialDependenceForClusters({
    //     tweets: tweets,
    //     features: selectedFeatures,
    //     modelId: currentModel
    //   })
    // );

    dispatch(
      runDTThenRunClandPD({
        tweets: tweets,
        selectedFeatures: selectedFeatures,
        modelId: currentModel
      })
    );

    // dispatch([
    //   dispatch(runClustering()),
    //   (dispatch, getState) => {
    //     // `getState()` returns the state (or store) which is computed through
    //     // first action, so you can use this updated store to find out needed
    //     // portion and pass it to next action creator
    //     const updatedTweets = getState().tweet.tweets;
    //     console.log('updatedTweets: ', getState());
    //     console.log('updatedTweets: ', updatedTweets);
    //     dispatch(
    //       runDT({ tweets: updatedTweets, selectedFeatures: selectedFeatures })
    //     );
    //   },
    //   (dispatch, getState) => {
    //     // `getState()` returns the state (or store) which is computed through
    //     // first action, so you can use this updated store to find out needed
    //     // portion and pass it to next action creator
    //     const updatedTweets = getState().tweet.tweets;
    //     dispatch(
    //       calculatePartialDependence({
    //         modelId: currentModel,
    //         tweets: updatedTweets,
    //         features: selectedFeatures
    //       })
    //     );
    //   }
    // ]);
  }, []);
  // if (
  //   !clusterIdsInTweets ||
  //   clusterIdsInTweets.length === 0 ||
  //   typeof clusterIdsInTweets[0] === 'undefined'
  // )

  // prettier-ignore
  // if (
  //   (!clusterIdsForTweets ||
  //   clusterIdsForTweets.length === 0)||
  //   (!pdpValues || pdpValues.length === 0) ||
  //   typeof(tweets[0].clusterId) == 'undefined'
  // )

  console.log('in GlobalInterpreterWrapper: before', isLoaded);
  console.log('in GlobalInterpreterWrapper: before', pdpValues);
  console.log('in GlobalInterpreterWrapper: before', clusterIdsForTweets);

  if (
    // !clusterIdsForTweets ||
    // clusterIdsForTweets.length === 0 ||
    // !pdpValues ||
    // pdpValues.length === 0 ||
    !clusters ||
    clusters.length === 0 ||
    isLoaded === false
  )
    return <div />;

  console.log('in GlobalInterpreterWrapper: ', isLoaded);
  console.log('in GlobalInterpreterWrapper: ', tweets);
  console.log('in GlobalInterpreterWrapper: ', clusters);

  return (
    <GlobalInterpreterWrapper>
      <div style={{ gridArea: 't' }}>
        <SectionTitle>Global Interpretability</SectionTitle>
      </div>
      <div style={{ gridArea: 'md' }}>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <SubsectionTitle>Mode: </SubsectionTitle>
        &nbsp;&nbsp;&nbsp;
        <ModeDropdown
          multiple={false}
          value={globalModesWithDisplay[globalMode].display}
          onChange={(e, i) => {
            console.log('onChange in value: ', e, e.option);
            dispatch({ type: 'CHANGE_GLOBAL_MODE', payload: e.selected });
          }}
          options={globalModesWithDisplay.map(d => d.display)}
          size={'xsmall'}
        />
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
        numFeatures={numFeatures}
        tweets={tweets}
        selectedFeatures={selectedFeatures}
        clusters={clusters}
        // clusterIdsForTweets={clusterIdsForTweets}
        // pdpValues={pdpValues}
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

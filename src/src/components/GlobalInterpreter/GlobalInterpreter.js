import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import { runDT } from '../../modules/tweet';
import {
  runClustering,
  runClusteringAndPartialDependenceForClusters
} from '../../modules/cluster';
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

const GlobalInterpreter = props => {
  const dispatch = useDispatch();
  const {
    currentModel,
    selectedFeatures,
    tweets,
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
    console.log('in globalinterpreter useeffect: ', tweets);
    dispatch(runDT({ tweets: tweets, selectedFeatures: selectedFeatures }));
    dispatch(
      runClusteringAndPartialDependenceForClusters({
        tweets: tweets,
        features: selectedFeatures,
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
      <Generator tweets={tweets} selectedFeatures={selectedFeatures} />
      <AbstrctFeaturePlotView numAbstractFeatures={numAbstractFeatures} />
      <FeaturePlotView
        numFeatures={numFeatures}
        tweets={tweets}
        selectedFeatures={selectedFeatures}
        clusters={clusters}
        // clusterIdsForTweets={clusterIdsForTweets}
        // pdpValues={pdpValues}
        isLoaded={isLoaded}
      />
      <WordPlotView numFeatures={numFeatures} words={words} />
    </GlobalInterpreterWrapper>
  );
};

export default GlobalInterpreter;

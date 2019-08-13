import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GlobalInterpreter from '../components/GlobalInterpreter/GlobalInterpreter';

const GlobalInterpreterContainer = () => {
  const { tweets, tweetsWithPredFeatures, isLoaded } = useSelector(
      state => state.tweet,
      []
    ),
    { clusters } = useSelector(state => state.cluster, []),
    {
      currentModel,
      features,
      selectedFeatures,
      globalMode,
      pdpValues
    } = useSelector(state => state.globalInterpreter, []);

  console.log('in global container: ', pdpValues);
  const words = [
    {
      word: 'hate',
      fromFeature: 'valence',
      importance: '0.8',
      numTweetsGroupRatio: { con: 0.4, lib: 0.6 }
    },
    {
      word: 'act',
      fromFeature: 'dominance',
      importance: '0.7',
      numTweetsGroupRatio: { con: 0.7, lib: 0.3 }
    },
    {
      word: 'dominant',
      fromFeature: 'dominance',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.94, lib: 0.06 }
    },
    {
      word: 'fair',
      fromFeature: 'fairness',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.24, lib: 0.76 }
    },
    {
      word: 'care',
      fromFeature: 'harm',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.14, lib: 0.86 }
    },
    {
      word: 'bad',
      fromFeature: 'harm',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.5, lib: 0.5 }
    }
  ];

  console.log(!tweets || tweets.length === 0);
  if (!tweets || tweets.length === 0) return <div />;

  return (
    <GlobalInterpreter
      globalMode={globalMode}
      tweets={tweets}
      tweetsWithPredFeatures={tweetsWithPredFeatures}
      clusters={clusters}
      // clusterIdsForTweets={clusterIdsForTweets}
      words={words}
      currentModel={currentModel}
      features={features}
      selectedFeatures={selectedFeatures}
      pdpValues={pdpValues}
      isLoaded={isLoaded}
    />
  );
};

export default GlobalInterpreterContainer;

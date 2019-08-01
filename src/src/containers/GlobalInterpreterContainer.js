import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GlobalInterpreter from '../components/GlobalInterpreter/GlobalInterpreter';

const GlobalInterpreterContainer = () => {
  const { tweets } = useSelector(state => state.dataLoader, []),
    { clusters } = useSelector(state => state.cluster, []),
    { currentModel, selectedFeatures } = useSelector(
      state => state.globalInterpreter,
      []
    );
  const dispatch = useDispatch();

  const words = [
    {
      word: 'hate',
      fromFeature: 'valence',
      importance: '0.8',
      numTweetsGroupRatio: { con: 0.4, lib: 0.6 }
    },
    {
      word: 'act',
      fromFeature: 'arousal',
      importance: '0.7',
      numTweetsGroupRatio: { con: 0.7, lib: 0.3 }
    },
    {
      word: 'dominant',
      fromFeature: 'arousal',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.94, lib: 0.06 }
    },
    {
      word: 'fair',
      fromFeature: 'moral1',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.24, lib: 0.76 }
    },
    {
      word: 'care',
      fromFeature: 'moral2',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.14, lib: 0.86 }
    },
    {
      word: 'bad',
      fromFeature: 'valence',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.5, lib: 0.5 }
    }
  ];

  if (!tweets || tweets.length === 0) return <div />;
  else
    return (
      <GlobalInterpreter
        tweets={tweets}
        clusters={clusters}
        words={words}
        currentModel={currentModel}
        selectedFeatures={selectedFeatures}
      />
    );
};

export default GlobalInterpreterContainer;

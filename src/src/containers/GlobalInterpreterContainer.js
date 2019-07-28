import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import GlobalInterpreter from '../components/GlobalInterpreter/GlobalInterpreter';

const GlobalInterpreterContainer = () => {
  const { tweets } = useSelector(state => state.dataLoader, []),
    { clusters } = useSelector(state => {
      console.log('reducers: ', state);
      return state.cluster;
    }, []);
  const dispatch = useDispatch();

  console.log('clusters in globalinterpretercontainer: ', clusters);

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
      fromFeature: 'dominance',
      importance: '0.6',
      numTweetsGroupRatio: { con: 0.24, lib: 0.76 }
    }
  ];

  return (
    <GlobalInterpreter tweets={tweets} clusters={clusters} words={words} />
  );
};

export default GlobalInterpreterContainer;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import GlobalInterpreter from '../components/GlobalInterpreter/GlobalInterpreter';

const GlobalInterpreterContainer = () => {
  const data = useSelector(state => state.dataLoader, []);
  const dispatch = useDispatch();

  const clusters = [
    {
      id: 1,
      numTweets: 40,
      groupRatio: { con: 0.6, lib: 0.4 },
      pdpValue: 0.87
    },
    {
      id: 2,
      numTweets: 100,
      groupRatio: { con: 0.4, lib: 0.6 },
      pdpValue: 0.6
    },
    {
      id: 3,
      numTweets: 130,
      groupRatio: { con: 0.8, lib: 0.4 },
      pdpValue: 0.34
    }
  ];

  return <GlobalInterpreter tweets={data} clusters={clusters} />;
};

export default GlobalInterpreterContainer;

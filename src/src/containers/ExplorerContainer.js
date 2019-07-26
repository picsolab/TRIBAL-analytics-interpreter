import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import Explorer from '../components/Explorer/Explorer';

const ExplorerContainer = () => {
  const tweets = useSelector(reducer => reducer.dataLoader, []);

  return <Explorer tweets={tweets} />;
};

export default ExplorerContainer;

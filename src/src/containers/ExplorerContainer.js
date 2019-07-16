import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import Explorer from '../components/Explorer/Explorer';

const ExplorerContainer = () => {
  const data = useSelector(state => state.browser, []);
  const dispatch = useDispatch();

  return <Explorer data={data} />;
};

export default ExplorerContainer;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Counter from '../components/Counter';
import LocalView from '../components/LocalView';
import { increment, decrement } from '../modules/counter';
import RetrievalView from '../components/RetrievalView';

const RetrievalViewContainer = () => {
  const counter = useSelector(state => state.counter, []);
  const dispatch = useDispatch();

  return <RetrievalView number={counter} />;
};

export default RetrievalViewContainer;

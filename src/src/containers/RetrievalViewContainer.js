import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import RetrievalView from '../components/Explorer/RetrievalView';

const RetrievalViewContainer = () => {
  const counter = useSelector(state => state.counter, []);
  const dispatch = useDispatch();

  return <RetrievalView number={counter} />;
};

export default RetrievalViewContainer;

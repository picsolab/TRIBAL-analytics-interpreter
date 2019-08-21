import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ResultView from '../components/ResultView';

const ResultViewContainer = () => {
  const { models } = useSelector(state => state.globalInterpreter, []);

  return <ResultView models={models} />;
};

export default ResultViewContainer;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import GlobalInterpreter from '../components/GlobalInterpreter/FeaturePlotView';

const GlobalInterpreterContainer = () => {
  const data = useSelector(state => state.browser, []);
  const dispatch = useDispatch();

  return <GlobalInterpreter data={data} />;
};

export default GlobalInterpreterContainer;

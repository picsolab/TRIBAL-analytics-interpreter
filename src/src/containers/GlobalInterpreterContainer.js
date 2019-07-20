import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import GlobalInterpreter from '../components/GlobalInterpreter/GlobalInterpreter';

const GlobalInterpreterContainer = () => {
  const data = useSelector(state => state.dataLoader, []);
  const dispatch = useDispatch();

  return <GlobalInterpreter tweets={data} />;
};

export default GlobalInterpreterContainer;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LocalInterpreter from '../components/LocalInterpreter/LocalInterpreter';

const LocalInterpreterContainer = () => {
  const { instance, qType } = useSelector(state => state.localInterpreter, []);

  console.log('heello');
  return <LocalInterpreter instance={instance} qType={qType} />;
};

export default LocalInterpreterContainer;

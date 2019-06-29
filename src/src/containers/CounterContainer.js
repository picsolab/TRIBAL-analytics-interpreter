import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Counter from '../components/Counter';
import LocalView from '../components/LocalView';
import { increment, decrement } from '../modules/counter';

const CounterContainer = () => {
  const counter = useSelector(state => state.counter, []);
  const dispatch = useDispatch();

  return <Counter number={counter} />;
};

export default CounterContainer;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import Browser from '../components/Browser';

const BrowserContainer = () => {
  const data = useSelector(state => state.browser, []);
  const dispatch = useDispatch();

  return <Browser data={data} />;
};

export default BrowserContainer;

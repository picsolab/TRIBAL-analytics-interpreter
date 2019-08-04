import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import ListView from '../components/ListView';

const ListViewContainer = () => {
  const tweets = useSelector(state => state.tweet, []);
  const dispatch = useDispatch();

  return <ListView tweets={tweets} />;
};

export default ListViewContainer;

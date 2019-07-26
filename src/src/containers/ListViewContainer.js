import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import ListView from '../components/ListView';

const ListViewContainer = () => {
  const data = useSelector(state => state.dataLoader, []);
  const dispatch = useDispatch();

  return <ListView tweets={data} />;
};

export default ListViewContainer;

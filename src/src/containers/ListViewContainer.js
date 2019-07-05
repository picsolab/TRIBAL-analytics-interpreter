import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import ListView from '../components/ListView';

const ListViewContainer = () => {
  const data = useSelector(state => {
    console.log(state);
    return state.data;
  }, []);
  const dispatch = useDispatch();

  return <ListView data1={data} />;
};

export default ListViewContainer;

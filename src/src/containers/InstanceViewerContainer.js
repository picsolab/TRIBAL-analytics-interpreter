import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import InstanceViewer from '../components/Explorer/InstanceViewer';

const InstanceViewerContainer = () => {
  const data = useSelector(state => state.instanceViewer, []);
  const dispatch = useDispatch();

  return <InstanceViewer data={data} />;
};

export default InstanceViewerContainer;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import InstanceViewer from '../components/InstanceViewer';

const InstanceViewerContainer = () => {
  const { tweets, selectedTweet } = useSelector(state => state.tweet, []);
  const dispatch = useDispatch();

  return <InstanceViewer tweets={tweets} selectedTweet={selectedTweet} />;
};

export default InstanceViewerContainer;

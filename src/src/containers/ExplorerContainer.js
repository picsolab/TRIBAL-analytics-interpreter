import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import Explorer from '../components/Explorer/Explorer';

const ExplorerContainer = () => {
  const { tweets } = useSelector(reducer => reducer.tweet, []),
    { users } = useSelector(reducer => reducer.user, []);
  console.log('tweets in explorerContainer: ', tweets, users);

  return <Explorer tweets={tweets} users={users} />;
};

export default ExplorerContainer;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import Explorer from '../components/Explorer/Explorer';

const ExplorerContainer = () => {
  const { tweets, tweetList, selectedTweet } = useSelector(
      reducer => reducer.tweet,
      []
    ),
    { users, userList } = useSelector(reducer => reducer.user, []);

  return (
    <Explorer
      tweets={tweets}
      tweetList={tweetList}
      users={users}
      userList={userList}
      selectedTweet={selectedTweet}
    />
  );
};

export default ExplorerContainer;

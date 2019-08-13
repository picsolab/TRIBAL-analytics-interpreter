import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../modules/counter';
import Explorer from '../components/Explorer/Explorer';

const ExplorerContainer = () => {
  const { tweets, tweetList, filteredTweetList, selectedTweet } = useSelector(
      reducer => reducer.tweet,
      []
    ),
    { users, userList, selectedUser } = useSelector(
      reducer => reducer.user,
      []
    );

  return (
    <Explorer
      tweets={tweets}
      tweetList={tweetList}
      filteredTweetList={filteredTweetList}
      users={users}
      userList={userList}
      selectedUser={selectedUser}
      selectedTweet={selectedTweet}
    />
  );
};

export default ExplorerContainer;

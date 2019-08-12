import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GroupViewer from '../components/GroupViewer';

const GroupViewerContainer = () => {
  const { tweets } = useSelector(reducer => reducer.tweet, []),
    { users } = useSelector(reducer => reducer.user, []),
    { features } = useSelector(reducer => reducer.globalInterpreter, []);

  console.log('in GroupViewerContainer: ', tweets);

  return <GroupViewer tweets={tweets} users={users} features={features} />;
};

export default GroupViewerContainer;

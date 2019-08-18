import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LocalInterpreter from '../components/LocalInterpreter/LocalInterpreter';

const LocalInterpreterContainer = () => {
  const { tweets, selectedTweet } = useSelector(state => state.tweet, []);
  const { currentModel } = useSelector(state => state.globalInterpreter, []);
  const { qType, contrastiveEXs } = useSelector(
    state => state.localInterpreter,
    []
  );

  if (!tweets || tweets.length === 0) return <div />;

  return (
    <LocalInterpreter
      tweets={tweets}
      selectedTweet={selectedTweet}
      qType={qType}
      contrastiveEXs={contrastiveEXs}
      currentModel={currentModel}
    />
  );
};

export default LocalInterpreterContainer;

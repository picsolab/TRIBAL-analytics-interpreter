import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LocalInterpreter from '../components/LocalInterpreter/LocalInterpreter';

const LocalInterpreterContainer = () => {
  const { tweets, selectedTweet, secondSelectedTweet } = useSelector(
    state => state.tweet,
    []
  );
  const { currentModel } = useSelector(state => state.globalInterpreter, []);
  const { qType, contrastiveRules, contrastiveEXs, diffRule } = useSelector(
    state => state.localInterpreter,
    []
  );

  if (!tweets || tweets.length === 0) return <div />;

  return (
    <LocalInterpreter
      tweets={tweets}
      selectedTweet={selectedTweet}
      secondSelectedTweet={secondSelectedTweet}
      qType={qType}
      contrastiveRules={contrastiveRules}
      contrastiveEXs={contrastiveEXs}
      currentModel={currentModel}
      diffRule={diffRule}
    />
  );
};

export default LocalInterpreterContainer;

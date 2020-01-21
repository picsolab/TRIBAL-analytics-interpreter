import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LocalInterpreter from '../components/LocalInterpreter/LocalInterpreter';

const LocalInterpreterContainer = () => {
  const { 
    tweets, 
    selectedTweet, 
    secondSelectedTweet 
  } = useSelector(state => state.tweet, []);

  const { 
    currentModel, 
    features 
  } = useSelector(state => state.globalInterpreter, []);

  const { 
    qType, 
    contrastiveRules, 
    selectedTweetRules,
    contrastiveEXs, 
    diffRule,
    isCFLoading
  } = useSelector(state => state.localInterpreter, []);

  if (!tweets || tweets.length === 0) return <div />;

  return (
    <LocalInterpreter
      tweets={tweets}
      selectedTweet={selectedTweet}
      secondSelectedTweet={secondSelectedTweet}
      features={features}
      qType={qType}
      selectedTweetRules={selectedTweetRules}
      contrastiveRules={contrastiveRules}
      contrastiveEXs={contrastiveEXs}
      currentModel={currentModel}
      diffRule={diffRule}
      isCFLoading={isCFLoading}
    />
  );
};

export default LocalInterpreterContainer;

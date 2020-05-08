import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GlobalInterpreter from '../components/GlobalInterpreter/GlobalInterpreter';

const GlobalInterpreterContainer = () => {
  const {
      tweets,
      words,
      seqs,
      tweetsWithPredFeatures,
      isLoaded,
      tfidf,
      cooc
    } = useSelector(state => state.tweet, []),
    { clusters, 
      clustersForGoals, 
      clusterIdsForTweets 
    } = useSelector(state => state.cluster, []),
    {
      currentModelInfo,
      goals,
      groups,
      features,
      selectedFeatures,
      globalMode,
      pdpValues,
      pdpValuesForGroups,
      pdpValuesForCls,
      pdpValuesForClsGroups,
      isClusterSelected,
      tweetsInClusterForSeqPlot
    } = useSelector(state => state.globalInterpreter, []);

  if (!tweets || tweets.length === 0) return <div />;

  console.log('seqs: ', seqs);

  return (
    <GlobalInterpreter
      globalMode={globalMode}
      tweets={tweets}
      goals={goals}
      words={words}
      seqs={seqs}
      tweetsWithPredFeatures={tweetsWithPredFeatures}
      clusters={clusters}
      clustersForGoals={clustersForGoals}
      clusterIdsForTweets={clusterIdsForTweets}
      currentModelInfo={currentModelInfo}
      groups={groups}
      features={features}
      selectedFeatures={selectedFeatures}
      pdpValues={pdpValues}
      pdpValuesForGroups={pdpValuesForGroups}
      pdpValuesForCls={pdpValuesForCls}
      pdpValuesForClsGroups={pdpValuesForClsGroups}
      isLoaded={isLoaded}
      isClusterSelected={isClusterSelected}
      tweetsInClusterForSeqPlot={tweetsInClusterForSeqPlot}
      tfidf={tfidf}
      cooc={cooc}
    />
  );
};

export default GlobalInterpreterContainer;

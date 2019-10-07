import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GlobalInterpreter from '../components/GlobalInterpreter/GlobalInterpreter';

const GlobalInterpreterContainer = () => {
  const { tweets, words, tweetsWithPredFeatures, isLoaded } = useSelector(
      state => state.tweet,
      []
    ),
    { clusters } = useSelector(state => state.cluster, []),
    {
      currentModel,
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

  return (
    <GlobalInterpreter
      globalMode={globalMode}
      tweets={tweets}
      words={words}
      tweetsWithPredFeatures={tweetsWithPredFeatures}
      clusters={clusters}
      // clusterIdsForTweets={clusterIdsForTweets}
      currentModel={currentModel}
      goals={goals}
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
    />
  );
};

export default GlobalInterpreterContainer;

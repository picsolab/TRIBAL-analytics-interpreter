import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import {Spin, Icon} from 'antd';
import {Grommet, Button, Select} from 'grommet';
import {grommet} from 'grommet/themes';
import {deepMerge} from 'grommet/utils';
import index from '../../index.css';
import {StylesContext} from '@material-ui/styles/StylesProvider';
import {globalColors, SectionWrapper, SectionTitle, SubsectionTitle, SubTitle} from '../../GlobalStyles';

import {runDTThenRunClandPD, fetchWords, fetchSeqs} from '../../modules/tweet';
import {runDT} from '../../modules/globalInterpreter';

import Generator from './Generator';
import AbstrctFeaturePlotView from './AbstractFeaturePlotView';
import FeaturePlotView from './FeaturePlotView';
import SeqPlotView from './SeqPlotView';

const GlobalInterpreterWrapper = styled(SectionWrapper).attrs({
  className: 'global_interpreter'
})`
  grid-area: g;
  display: grid;
  margin-top: 0;
  // grid-template-columns: 100%;
  grid-template-rows: 200px 650px;
  grid-template-columns: 100%;
  grid-template-areas:
    'ge'
    'fp';
`;

const ModeViewWrapper = styled.div.attrs({
  className: 'mode_view_wrapper'
})`
  grid-area: md;
  display: flex;
  align-items: center;
  border: 1px solid #dadada;
`;

const ModeDropdown = styled(Select).attrs({
  className: 'mode_dropdown'
})`
  width: 80%;
  height: 35px;
  // background-color: white;
  // border: 1px solid whitesmoke;
  border-radius: 10px;
`;

const IndicatorTitle = styled.div.attrs({
  className: 'data_indicator_title'
})`
  height: 15px;
  background-color: mediumaquamarine;
  color: black;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
  line-height: 0.7;
  font-size: 0.6rem;
  margin: 2px 0;
`;

const QuestionIndicatorTitle = styled(IndicatorTitle).attrs({
  className: 'data_indicator_title'
})`
  width: 55px;
`;

const FeatureIndicator = styled.span.attrs({
  className: 'data_indicator'
})`
  height: 15px;
  background-color: black;
  color: white;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
  line-height: 0.5;
`;

const TargetIndicator = styled.span.attrs({
  className: 'target_indicator'
})`
  height: 15px;
  background-color: black;
  color: white;
  font-weight: 600;
  padding: 4px;
  border-radius: 3px;
  line-height: 0.5;
`;

const QuestionDiv = styled.span.attrs({
  className: 'question_wrapper'
})`
  height: 20px;
  background-color: rgb(190, 255, 231);
  color: black;
  font-weight: 600;
  padding: 4px 6px;
  margin-bottom: 2px;
  border-radius: 3px;
`;

const globalModes = [
  {
    type: 1,
    feature: 'True',
    target: 'True',
    question: 'Are groups predictable by their tendency in expressing emotion and moral values?',
    display: ''
  },
  {
    type: 2,
    feature: 'True',
    target: 'Predicted',
    question: 'How well can (shallow) machine predict ideological groups?',
    display: ''
  },
  {
    type: 3,
    feature: 'Predicted',
    target: 'Predicted',
    question: 'How well can construct values be predicted by (shallow) machine?',
    display: ''
  },
  {
    type: 4,
    feature: 'Predicted',
    target: 'Predicted',
    question: 'How well can groups be predicted by DL machine with low-level and theory-informed features?',
    display: ''
  }
];

const customDropdownTheme = {
  global: {
    font: {
      size: '0.7rem'
    },
    extend: `
      width: 70%;
    `
  },
  select: {
    container: {
      extend: `
      width: 100%;
    `
    }
  },
  options: {
    text: {
      fontSize: '0.7rem'
    }
  }
};

const globalModesWithDisplay = globalModes.map(d => ({
  ...d,
  display: (
    <div style={{padding: '5px', margin: '5px'}}>
      <div
        style={{
          display: 'flex',
          height: '30px',
          alignItems: 'center',
          fontSize: '0.7rem'
        }}
      >
        <div>
          <IndicatorTitle>Features</IndicatorTitle>
          <FeatureIndicator>{d.feature}</FeatureIndicator>
        </div>
        &nbsp;
        <span>{'-'}</span>
        &nbsp;
        <div>
          <IndicatorTitle>target</IndicatorTitle>
          <TargetIndicator>{d.target}</TargetIndicator>
        </div>
        &nbsp;&nbsp;&nbsp;
        <div>
          <QuestionIndicatorTitle>Question</QuestionIndicatorTitle>
          <QuestionDiv>{d.question}</QuestionDiv>
        </div>
      </div>
    </div>
  )
}));

const GlobalInterpreter = props => {
  const dispatch = useDispatch();
  const {
    globalMode,
    currentModelInfo,
    groups,
    features,
    selectedFeatures,
    tweets,
    words,
    seqs,
    goals,
    tweetsWithPredFeatures,
    clusters,
    clustersForGoals,
    clusterIdsForTweets,
    pdpValues,
    pdpValuesForGroups,
    pdpValuesForCls,
    pdpValuesForClsGroups,
    isLoaded,
    isClusterSelected,
    tweetsInClusterForSeqPlot,
    tfidf,
    cooc
  } = props;
  const numFeatures = 6,
    numAbstractFeatures = 1;

  useEffect(() => {
    // dispatch(
    //   fetchWordsThenCalTFIDFAndCooc({
    //     groups: groups,
    //     tweets: tweets,
    //     words: words
    //   })
    // );

    dispatch(
      fetchWords({
        groups: groups,
        tweets: tweets,
        words: words
      })
    );

    dispatch(
      fetchSeqs({
        opt: 'static',
        mode: 'all',
        tweetIds: tweets.map(d => d.tweetIdx),
        seqWeights: {
          post: 1,
          ranking: 1,
          length: 1,
          freq: 1
        }
      })
    );

    dispatch(
      runDTThenRunClandPD({
        tweets: tweets,
        selectedFeatures: selectedFeatures,
        modelId: currentModelInfo.id,
        groups: groups
      })
    );
  }, []);

  const loadingIcon = <Icon type="loading" style={{fontSize: 24}} spin />;

  if (!clusters || clusters.length === 0 || isLoaded === false)
    return (
      <GlobalInterpreterWrapper>
        {/* <Generator
          globalMode={globalMode}
          goals={goals}
          tweets={tweets}
          tweetsWithPredFeatures={tweetsWithPredFeatures}
          features={features}
          selectedFeatures={selectedFeatures}
        /> */}
      </GlobalInterpreterWrapper>
    );

  return (
    <GlobalInterpreterWrapper>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          // backgroundColor: 'white',
          margin: '5px',
          padding: '4px',
          height: '80px'
          // border: '0.5px solid #e6e6e6'
        }}
      >
        {/* &nbsp;&nbsp;&nbsp;&nbsp;
        <SubsectionTitle>Mode: </SubsectionTitle>
        &nbsp;&nbsp;&nbsp; */}
        {/* <Grommet theme={deepMerge(grommet, customDropdownTheme)}> */}
        {/* <ModeDropdown
          multiple={false}
          value={globalModesWithDisplay[globalMode].display}
          onChange={(e, i) => {
            const selectedGlobalMode = e.selected;
            dispatch({
              type: 'CHANGE_GLOBAL_MODE',
              payload: selectedGlobalMode
            });

            dispatch({
              type: 'UPDATE_TWEETS_ON_CHANGING_GLOBAL_MODE',
              payload: selectedGlobalMode
            });

            if (globalMode !== selectedGlobalMode) {
              selectedGlobalMode === 2 || selectedGlobalMode === 3
                ? dispatch(
                    runDTThenRunClandPD({
                      tweets: tweetsWithPredFeatures,
                      selectedFeatures: selectedFeatures,
                      modelId: currentModel,
                      groups: groups
                    })
                  )
                : // when selectedGlobalMode is 0 or 1
                  dispatch(
                    runDTThenRunClandPD({
                      tweets: tweets,
                      selectedFeatures: selectedFeatures,
                      modelId: currentModel,
                      groups: groups
                    })
                  );
            }
          }}
          options={globalModesWithDisplay.map(d => d.display)}
          size={'small'}
        /> */}
        {/* </Grommet> */}
        {/* <QuestionDiv>
          {'How well can (shallow) machine predict ideological groups?'}
        </QuestionDiv> */}
      </div>
      <Generator
        globalMode={globalMode}
        goals={goals}
        groups={groups}
        tweets={tweets}
        tweetsWithPredFeatures={tweetsWithPredFeatures}
        features={features}
        selectedFeatures={selectedFeatures}
      />
      <AbstrctFeaturePlotView 
        numAbstractFeatures={numAbstractFeatures} 
        globalMode={globalMode} 
      />
      <FeaturePlotView
        globalMode={globalMode}
        currentModelInfo={currentModelInfo}
        groups={groups}
        numFeatures={numFeatures}
        goals={goals}
        tweets={tweets}
        words={words}
        seqs={seqs}
        features={selectedFeatures}
        clusters={clusters}
        clustersForGoals={clustersForGoals}
        clusterIdsForTweets={clusterIdsForTweets}
        pdpValues={pdpValues}
        pdpValuesForGroups={pdpValuesForGroups}
        pdpValuesForCls={pdpValuesForCls}
        pdpValuesForClsGroups={pdpValuesForClsGroups}
        isLoaded={isLoaded}
        tfidf={tfidf}
        cooc={cooc}
        wordsInTweets={tweets}
        isClusterSelected={isClusterSelected}
        tweetsInClusterForSeqPlot={tweetsInClusterForSeqPlot}
      />
      {/* <SeqPlotView
        globalMode={globalMode}
        numFeatures={numFeatures}
        wordsInTweets={tweets}
        selectedFeatures={selectedFeatures}
        isClusterSelected={isClusterSelected}
        tweetsInClusterForSeqPlot={tweetsInClusterForSeqPlot}
      /> */}
    </GlobalInterpreterWrapper>
  );
};

export default GlobalInterpreter;

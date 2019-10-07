import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import { searchTweets } from '../../modules/explorer';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
  SectionWrapper,
  SectionTitle,
  SubTitle,
  globalColors
} from '../../GlobalStyles';

const layout = {
  margin: { top: 20, right: 110, bottom: 20, left: 30 },
  width: 600,
  height: 200,
  leftMargin: 30,
  innerHeight: 340 - 2,
  wordPlot: {
    width: 600,
    height: 240,
    leftMargin: 10
  },
  wordGroupPlot: {
    width: 150,
    height: 150,
    leftMargin: 30
  }
};

const numFeatures = 4;

const SeqPlotViewWrapper = styled.div.attrs({
  className: 'word_plot_view_wrapper'
})`
  width: 70%;
  grid-area: w;
  display: flex;
  margin-top: 10px;
  padding-left: ${layout.margin.left + 'px'};
  overflow-y: scroll;
`;

const WordPlotWrapper = styled.div.attrs({
  className: 'word_plot_wrapper'
})`
  display: flex;
  width: ${layout.wordPlot.width + 'px'};
  margin-left: ${layout.wordPlot.leftMargin + 'px'};
`;

const WordListWrapper = styled.div.attrs({
  className: 'word_list_wrapper'
})`
  width: ${(layout.wordPlot.width - layout.margin.left) / numFeatures + 'px'};
  height: 100px;
  overflow-y: scroll;
  padding: 3px;
  margin-bottom: 5px;
  background-color: whitesmoke;
`;

const FeatureIndicator = styled.div.attrs({
  className: 'feature_indicator'
})`
  margin-bottom: 5px;
  display: inline-block;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.8rem;
`;

const ValueIndicator = styled.div.attrs({
  className: 'value_indicator'
})`
  padding-left: 5px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.7rem;
  background-color: mediumaquamarine;
`;

const WordWrapper = styled.div.attrs({
  className: 'word_wrapper'
})`
  font-size: 0.7rem;
  border-radius: 5px;
  background-color: gray;
  color: white;
  // text-align: center;
  display: inline-block;
  margin: 2px 1px;
  line-height: 1.7;
  padding: 0 5px;
  opacity: 0.8;
`;

const WordGroupPlot = styled.div.attrs({
  className: 'word_group_plot_wrapper'
})``;

//* For the word plot
// const filterWordsByFeature = feature => {
//   const divWords = words
//     .filter(d => d.fromFeature === feature)
//     .map(d => <WordWrapper>{d.word}</WordWrapper>);

//   return <WordListWrapper>{divWords}</WordListWrapper>;
// };

const Word = ({ word }) => {
  const dispatch = useDispatch();
  const seqDivColorScale = d3
    .scaleLinear()
    .domain([0, 0.5, 1])
    .range([globalColors.group.con, 'gray', globalColors.group.lib]);

  return (
    <WordWrapper
      style={{ backgroundColor: seqDivColorScale(word.libRatio) }}
      onClick={function(e) {
        dispatch(
          searchTweets({
            searchKeyword: word.seq
          })
        );
      }}
    >
      {word.seq}
    </WordWrapper>
  );
};

const SeqListForCluster = ({
  isClusterSelected,
  tweetsInClusterForSeqPlot
}) => {
  const features = ['valence', 'fairness', 'dominance', 'care'];
  if (isClusterSelected === false)
    return (
      <div
        style={{
          marginLeft: '15px',
          marginTop: '10px',
          width: '20%'
        }}
      >
        <div
          style={{
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Sequences in cluster
        </div>
        <div
          style={{ background: 'whitesmoke', padding: '10px', height: '100%' }}
        />
      </div>
    );
  else if (isClusterSelected === true) {
    const corrTweetsInCluster = tweetsInClusterForSeqPlot.filter(
      d => parseInt(d.group) == d.pred
    );

    const seqsInCluster = corrTweetsInCluster.map(tweet => {
      var corrSeqs = [];
      features.map(feature => {
        if (parseInt(tweet.group) === tweet[feature + 'GrpPred'])
          corrSeqs.push({
            seq: tweet[feature + 'Seq'],
            seqRank: tweet[feature + 'SeqRank'],
            group: tweet.group
          });
      });

      return corrSeqs;
    });

    const groupBySeqInCluster = _.groupBy(
      _.flattenDeep(seqsInCluster, 2),
      'seq'
    );

    const uniqueSeqsInCluster = Object.keys(groupBySeqInCluster).map(seq => {
      const seqRanks = groupBySeqInCluster[seq].map(d => d.seqRank),
        seqCount = groupBySeqInCluster[seq].length,
        libSeqs = groupBySeqInCluster[seq].filter(d => d.group === '1');

      return {
        seq: seq,
        avgRank: _.mean(seqRanks),
        count: seqCount,
        libRatio:
          libSeqs.length === 0 || seqCount === 0 ? 0 : libSeqs.length / seqCount
      };
    });

    const top20SeqsForCluster = _.orderBy(
      uniqueSeqsInCluster,
      ['avgRank', 'count'],
      ['asc', 'desc']
    ).slice(0, 20);

    return (
      <div
        style={{
          marginLeft: '15px',
          marginTop: '10px',
          width: '20%'
        }}
      >
        <div
          style={{
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Sequences in cluster
        </div>
        <div
          style={{ background: 'whitesmoke', padding: '10px', height: '100%' }}
        >
          {top20SeqsForCluster.map(uniqueSeq => (
            <Word word={uniqueSeq} />
          ))}
        </div>
      </div>
    );
  }
};

const WordList = ({ feature, wordsInTweets }) => {
  const featureName = feature.key;
  const wordsInCorrTweets = wordsInTweets.filter(
    d => parseInt(d.group) == d[featureName + 'GrpPred']
  );
  // const wordsOrderByFeature = _.orderBy(uniqueWordsFromCorrTweets, [
  //   featureName + 'SeqRank'
  // ]);

  const groupBySeq = _.groupBy(wordsInCorrTweets, featureName + 'Seq');
  const uniqueSeqs = Object.keys(groupBySeq).map(seq => {
    const tweets = groupBySeq[seq];
    const tweetRanks = tweets.map(d => d[featureName + 'SeqRank']);
    const featureValues = tweets.map(d => d[featureName]);
    const libTweets = tweets.filter(d => d.group === '1');
    return {
      seq: seq,
      tweets: tweets,
      importance: _.mean(tweetRanks),
      avgFeature: _.mean(featureValues),
      libRatio: libTweets.length === 0 ? 0 : libTweets.length / tweets.length
    };
  });

  var WordLists;
  if (feature.type === 'continuous') {
    const wordsAboveThreshold = wordsInCorrTweets.filter(
        d => d[featureName] > 0.5
      ),
      wordsBelowThreshold = wordsInCorrTweets.filter(
        d => d[featureName] <= 0.5
      );
    const groupBySeqAboveThreshold = _.groupBy(
      wordsAboveThreshold,
      featureName + 'Seq'
    );
    const groupBySeqBelowThreshold = _.groupBy(
      wordsBelowThreshold,
      featureName + 'Seq'
    );
    const uniqueWordsAboveThreshold = Object.keys(groupBySeqAboveThreshold).map(
      seq => {
        const tweets = groupBySeq[seq];
        const tweetRanks = tweets.map(d => d[featureName + 'SeqRank']);
        const featureValues = tweets.map(d => d[featureName]);
        const libTweets = tweets.filter(d => d.group === '1');
        return {
          seq: seq,
          tweets: tweets,
          importance: _.mean(tweetRanks),
          avgFeature: _.mean(featureValues),
          libRatio:
            libTweets.length === 0 ? 0 : libTweets.length / tweets.length
        };
      }
    );

    const uniqueWordsBelowThreshold = Object.keys(groupBySeqBelowThreshold).map(
      seq => {
        const tweets = groupBySeq[seq];
        const tweetRanks = tweets.map(d => d[featureName + 'SeqRank']);
        const featureValues = tweets.map(d => d[featureName]);
        const libTweets = tweets.filter(d => d.group === '1');
        return {
          seq: seq,
          tweets: tweets,
          importance: _.mean(tweetRanks),
          avgFeature: _.mean(featureValues),
          libRatio:
            libTweets.length === 0 ? 0 : libTweets.length / tweets.length
        };
      }
    );
    WordLists = (
      <div>
        <ValueIndicator>{'HIGH'}</ValueIndicator>
        <WordListWrapper>
          {uniqueWordsAboveThreshold.slice(0, 10).map(word => (
            <Word word={word} />
          ))}
        </WordListWrapper>
        <ValueIndicator>{'LOW'}</ValueIndicator>
        <WordListWrapper>
          {uniqueWordsBelowThreshold.slice(0, 10).map(word => (
            <Word word={word} />
          ))}
        </WordListWrapper>
      </div>
    );
  } else if (feature.type === 'categorical') {
    WordLists = feature.values.map(value => {
      const wordsWithFeatureValue = wordsInCorrTweets.filter(
        d => d[featureName] === value.num
      );

      const groupBySeqWithFeatureValue = _.groupBy(
        wordsWithFeatureValue,
        featureName + 'Seq'
      );
      const uniqueWordsWithFeatureValue = Object.keys(
        groupBySeqWithFeatureValue
      ).map(seq => {
        const tweets = groupBySeq[seq];
        const tweetRanks = tweets.map(d => d[featureName + 'SeqRank']);
        const featureValues = tweets.map(d => d[featureName]);
        const libTweets = tweets.filter(d => d.group === '1');
        return {
          seq: seq,
          tweets: tweets,
          importance: _.mean(tweetRanks),
          avgFeature: _.mean(featureValues),
          libRatio:
            libTweets.length === 0 ? 0 : libTweets.length / tweets.length
        };
      });
      return (
        <div>
          <ValueIndicator>{value.real}</ValueIndicator>
          <WordListWrapper>
            {uniqueWordsWithFeatureValue.slice(0, 10).map(word => (
              <Word word={word} />
            ))}
          </WordListWrapper>
        </div>
      );
    });
  }
  return <div>{WordLists}</div>;
};

const SeqPlotView = ({
  wordsInTweets,
  selectedFeatures,
  globalMode,
  isClusterSelected,
  tweetsInClusterForSeqPlot
}) => {
  const ref = useRef(null);

  useEffect(() => {
    //* For the word group view
    const svg = d3.select(ref.current);

    console.log('wordsInTweets: ', wordsInTweets);
  });

  return (
    <div style={{ display: 'flex' }}>
      <SeqPlotViewWrapper>
        {selectedFeatures.map(feature => (
          <div style={{ marginLeft: '10px' }}>
            <FeatureIndicator>{feature.key}</FeatureIndicator>
            <WordList feature={feature} wordsInTweets={wordsInTweets} />
          </div>
        ))}
        {/* <WordGroupPlot>
          <svg
            width={layout.wordGroupPlot.width}
            height={layout.wordGroupPlot.height}
            ref={ref}
          />
        </WordGroupPlot> */}
      </SeqPlotViewWrapper>
      <SeqListForCluster
        isClusterSelected={isClusterSelected}
        tweetsInClusterForSeqPlot={tweetsInClusterForSeqPlot}
      />
    </div>
  );
};

export default SeqPlotView;

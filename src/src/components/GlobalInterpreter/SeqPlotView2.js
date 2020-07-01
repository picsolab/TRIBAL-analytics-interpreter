import React, {useEffect, useRef} from 'react';

import * as d3 from 'd3';
import _ from 'lodash';
import d3tooltip from 'd3-tooltip';
import ReactTooltip from 'react-tooltip';
import {useSelector, useDispatch} from 'react-redux';

import {searchTweets} from '../../modules/explorer';

import Document from '../subcomponents/Document';
import styled from 'styled-components';
import {Button} from 'grommet';
import index from '../../index.css';
import {StylesContext} from '@material-ui/styles/StylesProvider';
import {SectionWrapper, SectionTitle, SubTitle, lCom, globalColors} from '../../GlobalStyles';

const layout = {
  margin: {top: 20, right: 110, bottom: 20, left: 15},
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

var numFeatures = 7;

const SeqPlotViewWrapper = styled.div.attrs({
  className: 'word_plot_view_wrapper'
})`
  width: 80%;
  height: 300px;
  grid-area: w;
  display: flex;
  margin-top: 10px;
  // padding-left: ${layout.margin.left + 'px'};
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
  
  height: 100px;
  overflow-y: scroll;
  padding: 3px;
  margin-bottom: 5px;
  // background-color: whitesmoke;
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
  background-color: whitesmoke;
`;

const WordWrapper = styled.div.attrs({
  className: 'word_wrapper'
})`
  font-size: 0.7rem;
  border-radius: 5px;
  font-weight: 600;
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

const tooltip = d3tooltip(d3);

const Word = ({word}) => {
  const dispatch = useDispatch();
  const seqDivColorScale = d3
    .scaleLinear()
    .domain([0, 0.5, 1])
    .range(globalColors.groups.map(d => d.color));

  return (
    <WordWrapper
      style={{
        border: '2px solid ' + seqDivColorScale(word.libRatio),
        color: seqDivColorScale(word.libRatio)
      }}
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

const SeqListForCluster = ({isClusterSelected, tweetsInClusterForSeqPlot}) => {
  const features = ['valence', 'fairness', 'dominance', 'care'];
  if (isClusterSelected === false)
    return (
      <div
        style={{
          marginLeft: '15px',
          marginTop: '10px',
          width: '15%'
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
        <div style={{
            borderTop: '2px solid whitesmoke', 
            padding: '10px', 
            height: '100%'
          }} />
      </div>
    );
  else if (isClusterSelected === true) {
    const corrTweetsInCluster = tweetsInClusterForSeqPlot.filter(d => parseInt(d.group) == d.pred);

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

    const groupBySeqInCluster = _.groupBy(_.flattenDeep(seqsInCluster, 2), 'seq');

    const uniqueSeqsInCluster = Object.keys(groupBySeqInCluster).map(seq => {
      const seqRanks = groupBySeqInCluster[seq].map(d => d.seqRank),
        seqCount = groupBySeqInCluster[seq].length,
        libSeqs = groupBySeqInCluster[seq].filter(d => d.group === '1');

      return {
        seq: seq,
        avgRank: _.mean(seqRanks),
        count: seqCount,
        libRatio: libSeqs.length === 0 || seqCount === 0 ? 0 : libSeqs.length / seqCount
      };
    });

    const top20SeqsForCluster = _.orderBy(uniqueSeqsInCluster, ['avgRank', 'count'], ['asc', 'desc']).slice(0, 20);

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
        <div style={{
            borderTop: '2px solid whitesmoke', 
            padding: '10px', 
            height: '100%'
          }}>
          {top20SeqsForCluster.map(uniqueSeq => (
            <Word word={uniqueSeq} />
          ))}
        </div>
      </div>
    );
  }
};

const WordList = ({feature, wordsInTweets}) => {
  const featureName = feature.key;
  const wordsInCorrTweets = wordsInTweets.filter(d => parseInt(d.group) == d[featureName + 'GrpPred']);
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
    const wordsAboveThreshold = wordsInCorrTweets.filter(d => d[featureName] > 0.5),
      wordsBelowThreshold = wordsInCorrTweets.filter(d => d[featureName] <= 0.5);
    const groupBySeqAboveThreshold = _.groupBy(wordsAboveThreshold, featureName + 'Seq');
    const groupBySeqBelowThreshold = _.groupBy(wordsBelowThreshold, featureName + 'Seq');
    const uniqueWordsAboveThreshold = Object.keys(groupBySeqAboveThreshold).map(seq => {
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

    const uniqueWordsBelowThreshold = Object.keys(groupBySeqBelowThreshold).map(seq => {
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
    WordLists = (
      <div style={{ 'width': (layout.wordPlot.width - layout.margin.left) / numFeatures + 'px' }}>
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
      const wordsWithFeatureValue = wordsInCorrTweets.filter(d => d[featureName] === value.num);

      const groupBySeqWithFeatureValue = _.groupBy(wordsWithFeatureValue, featureName + 'Seq');
      const uniqueWordsWithFeatureValue = Object.keys(groupBySeqWithFeatureValue).map(seq => {
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
      return (
        <div style={{ 'width': (layout.wordPlot.width - layout.margin.left) / numFeatures + 'px' }}>
          <ValueIndicator>{value.category}</ValueIndicator>
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

const SeqPlotView2 = ({
  wordsInTweets, 
  features, 
  globalMode, 
  seqs,
  isClusterSelected, 
  tweetsInClusterForSeqPlot
}) => {
  const ref = useRef(null);
  numFeatures = features.length;

  useEffect(() => {
    const width = 800,
      height = 300,
      radius = 6,
      paddingLeft = 10;

    const features = ['v', 'd', 'h', 'f', 'p', 'a', 'l'];

    const svg = d3.select(ref.current)
      .attr('width', 800)
      .attr('height', height);

    d3.selectAll('.g_seq_plot').remove();

    const groupColorScale = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range(['rgba(255, 34, 34, 0.5)', 'whitesmoke', 'rgba(25, 12, 226, 0.5)']);

    // const xFeatureScale = d3.scaleOrdinal()
    //   .domain(features)
    //   .range([20, 100, 200, 300, 400, 500, 600]);

    const xFeatureScale = d3
      .scalePoint()
      .domain(features)
      .range([0, lCom.hPlot.w]);

    const yFeatureProbForContScale = d3.scaleLinear()
      .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
      .range([280, 200, 160, 140, 100, 10]);

    const yFeatureForOrdScale = d3.scaleBand()
      .domain([0, 1, 2, 3])
      .range([280, 20]);

    let yGroupScalesInOrds = [];
    yFeatureForOrdScale.domain().forEach((ord, i) => {
      yGroupScalesInOrds.push(
        d3.scaleLinear()
          .domain([0, 1])
          .range([
            yFeatureForOrdScale.range()[0] - yFeatureForOrdScale.bandwidth() * i,
            yFeatureForOrdScale.range()[0] - yFeatureForOrdScale.bandwidth() * (i + 1)
          ])
      );
    });

    const gPlot = svg.append('g')
      .attr('class', 'g_seq_plot')
      .attr('id', Math.random())
      .attr('transform', 'translate(' + paddingLeft + ',' + 0 + ')');

    const xAxisSetting = d3
      .axisBottom(xFeatureScale)
      .tickSize(-height);

    const gAxisX = gPlot.append('g')
      .attr('class', 'g_plot_x_axis')
      .attr('transform', 'translate(' + paddingLeft + ',' + 300 + ')')
      .call(xAxisSetting)
      .call(g => g.select(".domain").remove());

    const simulation = d3.forceSimulation()
      // .force('link', d3.forceLink().distance(50))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('x', d3.forceX().strength(1).x(d => xFeatureScale(d.feature)))
      .force('y', d3.forceY().strength(1).y(d => d.groupProb))
      .force("collide", d3.forceCollide(d => d.widthForTick * 0.35).strength(1));

    let allSeqs = [];
    let yAxisSetting = d3
      .axisLeft(yFeatureProbForContScale)
      .tickValues([0, 0.2, 0.4, 0.6, 0.8, 1])
      .tickSize(10);

    let yFeatureScale = '';
    let yTickValues = [];
    let featureType = '';
    features.forEach(feature => {
      if (feature == 'v' || feature == 'd') {
        featureType = 'continuous';
        yFeatureScale = yFeatureProbForContScale;
        yTickValues = [0, 0.2, 0.4, 0.6, 0.8, 1];
      }
      else {
        featureType = 'ordinal';
        yFeatureScale = yFeatureForOrdScale;
        yTickValues = [0, 1, 2, 3];
      }

      let yAxisSetting = d3
        .axisLeft(yFeatureScale)
        .tickValues(yTickValues)
        .tickSize(10);

      gPlot.append('g')
        .attr('class', 'g_plot_y_axis ' + feature)
        .attr('transform', 'translate(' + (xFeatureScale(feature) + 16) + ',' + 0 + ')')
        .call(yAxisSetting)
        .call(g => g.select(".domain").remove());

      const updatedSeqsInFeature = seqs[feature].map(seq => ({
        ...seq,
        feature: feature,
        featureType: featureType
      }));

      allSeqs.push(...updatedSeqsInFeature);
    });

    allSeqs = _.orderBy(allSeqs, ['score'], ['asc']);

    const impScoreScale = d3.scaleLinear()
      .domain(d3.extent(allSeqs.map(d => d.score)))
      .range([7, 15]);

    const scoreThreshold = 0.98
    const node = gPlot.selectAll('.g_seq_subplot')
      .data(allSeqs)
      .enter().append('g')
      .attr('class', 'g_seq_subplot')
      .each(function (d) {
        const gText = d3.select(this);
        gText
            .append('rect')
            .attr('class', 'seq_rect')
            .attr('x', -5)
            .attr('width', d => impScoreScale(d.score))
            .attr('height', d => impScoreScale(d.score))
            .attr('rx', 1.5)
            .attr('ry', 1.5)
            .style('fill', d => groupColorScale(d.groupProb))
            .style('stroke', 'black')
            .on('mouseover', function(d, i) {
              d3.select(this)
                .style('stroke-width', 2)
              const seqHtml =
                'Sequence: ' +
                d.seq +
                '</br>' +
                'Feature: ' +
                Math.ceil(d.featureProb * 100) / 100 +
                '</br>' +
                'Group probability: ' +
                Math.ceil(d.groupProb * 100) / 100 +
                '</br>' +
                '</div>';
              tooltip.html(seqHtml);
              tooltip.show();
              // ReactTooltip.show(this);
            })
            .on('mouseout', function(d, i) {
              d3.select(this)
                .style('stroke-width', 1);
              tooltip.hide();
            });

          d.widthForTick = impScoreScale(d.score) + 10;

        if (d.score < scoreThreshold) {
          
        } else if (d.score >= scoreThreshold) {
          const seqText = gText
            .append('text')
            .attr('class', 'seq_text')
            .attr('x', 20)
            .attr('y', -10)
            .style('font-family', 'Helvetica')
            // .text(d => d.seq.split(' ').slice(0, 2))
            .text(d => extractImpSubseq(d.seq, d.attForSeq))
            .on('mouseover', function(d, i) {
              d3.select(this)
                .style('stroke-width', 2)
              const seqHtml =
                'Sequence: ' +
                d.seq +
                '</br>' +
                'Feature: ' +
                Math.ceil(d.featureProb * 100) / 100 +
                '</br>' +
                'Group probability: ' +
                Math.ceil(d.groupProb * 100) / 100 +
                '</br>' +
                '</div>';
              tooltip.html(seqHtml);
              tooltip.show();
            })
            .on('mouseout', function(d, i) {
              d3.select(this)
                .style('stroke-width', 1);
              tooltip.hide();
            });

          gText
            .append('rect')
            .attr('x', 15)
            .attr('y', -22)
            .attr('rx', 3)
            .attr('rx', 3)
            .attr('width', seqText.node().getBoundingClientRect().width + 10)
            .attr('height', seqText.node().getBoundingClientRect().height + 3)
            .style('fill', 'white')
            .style('stroke', d => 'gray')
            .style('stroke-width', 1)
            .style('fill-opacity', 0.5);

          gText
            .append('line')
            .attr('x1', 5)
            .attr('y1', 0)
            .attr('x2', 15)
            .attr('y2', -15)
            .style('stroke', 'gray')
            .style('stroke-array', '4,2')

          d.widthForTick = seqText.node().getBoundingClientRect().width / 2;
        }

      });

    simulation
      .nodes(allSeqs)
      .on('tick', tick);
    // .start();

    function extractImpSubseq(seq, att) {
      const seqArr = seq.split(' ');
      const maxAttIdx = _.indexOf(att, _.max(att));
      return seqArr[maxAttIdx] + '...';
    }

    console.log('yGroupScalesInOrds: ', yGroupScalesInOrds)
    function tick() {
      node.each(function (d) {
        // w = 50 * (1 + 10 * (1 - d.groupProb));
        if (d.featureType == 'continuous')
          d.y -= (.3 * (d.y - yFeatureProbForContScale(d.featureProb)))
        else
          d.y -= (.3 * (d.y - yGroupScalesInOrds[d.featureProb](d.groupProb)))
      })

      // node.attr('cx', function (d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
      //   .attr('cy', function (d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

      node
        .attr('transform', function (d) {
          var updatedX = Math.max(d.widthForTick, Math.min(width - d.widthForTick, d.x));
          var updatedY = Math.max(d.widthForTick, Math.min(height - 5, d.y));
          d.x = updatedX;
          d.y = updatedY;
          return 'translate(' +
            updatedX + ',' + updatedY + ')';
        })
    }
  });

  return (
    <div style={{display: 'flex'}}>
      <SeqPlotViewWrapper>
        <svg
          width={layout.wordGroupPlot.width}
          height={layout.wordGroupPlot.height}
          ref={ref}
        />
      </SeqPlotViewWrapper>
      <SeqListForCluster isClusterSelected={isClusterSelected} tweetsInClusterForSeqPlot={tweetsInClusterForSeqPlot} />
      <ReactTooltip />
    </div>
  );
};

export default SeqPlotView2;

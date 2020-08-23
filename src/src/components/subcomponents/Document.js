import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import d3tooltip from 'd3-tooltip';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import { grommet } from 'grommet/themes';
import { globalColors } from '../../GlobalStyles';

const tooltip = d3tooltip(d3);

const GroupDiv = styled.div.attrs({
  className: 'doc_glyph'
})`
  width: 10px;
  height: 10px;
  line-height: 5;
  margin-right: 5px;
  border: 1px solid black;
  color: white;
  font-weight: 500;
  text-align: center;

  ${({ group }) =>
    group === '1'
      ? `background-color: ` + globalColors.group.lib
      : `background-color: ` + globalColors.group.con};

  opacity: 0.5;
  cursor: pointer;
`;

const ScoreDiv = styled.div.attrs({
  className: 'score'
})``;

const ContentDiv = styled.div.attrs({
  className: 'content'
})`
  width: 90%;
  padding: 3px;
  font-size: 0.8rem;
`;

const IndexIndicatorWrapper = styled.div.attrs({
  className: 'index_indicator'
})`
  height: 20px;
  width: 40px;
  text-align: center;
  background: mediumaquamarine;
  color: white;
  margin-top: auto;
`;

const DocumentWrapper = styled.div.attrs({
  className: 'doc_wrapper'
})`
  border: 0.5px solid #e4e4e4;
  padding: 3px;
  margin: 5px 0;
  background-color: white;
`;

const ScoreView = ({ tweet, features }) => {
  const ref = useRef(null);
  const featureNames = features.map(d => d.key),
    numFeatures = featureNames.length,
    tweetScores = Object.values(_.pick(tweet, featureNames));
  const featuresUpdated = features.map(d => ({ ...d, tweet: tweet}));

  const layout = {
    width: 50,
    height: 35,
    marginBottom: 10,
    svg: {
      width: 50,
      height: 35
    }
  };

  var xFeatureScale = d3.scaleBand().range([0, layout.svg.width]);

  const numToCat4Scale = d3
    .scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range(['Vice', 'Both', 'None', 'Virtue']);
  const numToCat3Scale = d3
    .scaleOrdinal()
    .domain([0, 1, 2])
    .range(['Vice', 'None', 'Virtue']);

  useEffect(() => {
    const svg = d3.select(ref.current);
    const featureRecData = svg
      // .append('g')
      // .attr('class', 'g_score')
      .selectAll('.feature_rect')
      .data(tweetScores);

    xFeatureScale.domain(d3.range(numFeatures));

    // Modify this one, and the next one for updating
    featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', layout.svg.width / numFeatures - 3)
      .attr('height', (d, i) => layout.svg.height - layout.marginBottom - features[i].scoreScale(d))
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => features[i].scoreScale(d))
      .style('fill', globalColors.feature)
      .on('mouseover', (d, i) => {
        const titleHtml = '<div style="font-weight: 600">Features</div>';
        const scoreHtml = features.map(feature => {
          return (
            '<div>- ' +
            feature.key +
            ': ' +
            (feature.type === 'categorical'
              ? (feature.key === 'fairness') || (feature.key === 'purity')
                ? numToCat3Scale(tweet[feature.key])
                : numToCat4Scale(tweet[feature.key])
              : tweet[feature.key])
            + '</div>'
          );
        });

        tooltip.html(titleHtml + scoreHtml.join(''));
        tooltip.show();
      })
      .on('mouseout', (d, i) => {
        tooltip.hide();
      });
    featureRecData.exit().remove();
      
    featureRecData
      .attr('width', layout.svg.width / numFeatures - 3)
      .attr('height', (d, i) => {
        return (features[i].type === 'categorical')
          ? 25 - features[i].scoreScale(d) - features[i].scoreScale.bandwidth()
          : 25 - features[i].scoreScale(d)
      })
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => {
        return (features[i].type === 'categorical')
        ? features[i].scoreScale(d) + features[i].scoreScale.bandwidth()
        : features[i].scoreScale(d)
      })
      .on('mouseover', (d, i) => {
        const titleHtml = '<div style="font-weight: 600">Features</div>';
        const scoreHtml = features.map(feature => {
          return (
            '<div>- ' +
            feature.key +
            ': ' +
            (feature.type === 'categorical'
              ? (feature.key === 'fairness') || (feature.key === 'purity')
                ? numToCat3Scale(tweet[feature.key])
                : numToCat4Scale(tweet[feature.key])
              : tweet[feature.key])
            + '</div>'
          );
        });

        tooltip.html(titleHtml + scoreHtml.join(''));
        tooltip.show();
      })
      .on('mouseout', (d, i) => {
        tooltip.hide();
      });
    

    const featureTitle = svg
      .selectAll('.feature_title')
      .data(featuresUpdated)
      .enter()
      .append('text')
      .attr('class', d => 'feature_title ' + d.key)
      .text(d => d.abbr)
      .attr('x', (d, i) => xFeatureScale(i))
      .attr('y', (d, i) => layout.svg.height)
      .style('font-size', '0.6rem')
      .on('click', function(d) {
        const selectedTweet = d.tweet;
        const tweetIdx = d3.select(this.parentNode.parentNode.parentNode).attr('class').split('_')[1];
        const selectedFeatureTitle = d3.select(this);
        const isFeatureTitleSelected = selectedFeatureTitle.classed('feature_title_selected');

        if (isFeatureTitleSelected == false) {
          selectFeatureForTweet(true);
        } else {
          selectFeatureForTweet(false);
        }

        function selectFeatureForTweet(isSelected) {
          selectedFeatureTitle
            .classed('feature_title_selected', isSelected);

          let content = d3.select('.doc_' + tweetIdx)
            .select('.content').html().toLowerCase();
          let updatedSeqHtml = '';
          if (isSelected == true) {
            selectedFeatureTitle
              .style('fill', 'red')
              .style('font-weight', 600);
            
            const contentArr = content.split(' ');
  
            const impSeq = selectedTweet[d.key + 'Seq'].toLowerCase().replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
  
            //let impSeqArr = impSeq.split(' ');
            let startIdx = content.indexOf(impSeq.toLowerCase()),
                endIdx = startIdx + impSeq.toLowerCase().length;
            
            let htmlForImpSeq = '<span style="font-weight: 600; background-color: #ffe000;">' + impSeq + '</span>';
            const updatedSeqArr = [ content.slice(0, startIdx), htmlForImpSeq, content.slice(endIdx+1) ];
            
            updatedSeqHtml = updatedSeqArr.join(' ');
          } else {
            selectedFeatureTitle
              .style('fill', '')
              .style('font-weight', '');
            
            updatedSeqHtml = content.replace('<span style="font-weight: 600; background-color: #ffe000;">', '').replace('</span>', '');
          }
          
          d3.select('.doc_' + tweetIdx)
            .select('.content')
            .each(function(d) {
              d3.select(this).node().innerHTML = '';
              d3.select(this).html(updatedSeqHtml);
              // d3.select(this).text(updatedSeqHtml);
            });
        }
      });
  }, [tweet, ref.current]);

  return (
    <div
      style={{ width: layout.width, height: layout.height, marginLeft: 'auto' }}
    >
      <svg width="100%" height="100%" ref={ref} />
    </div>
  );
};

const IndexIndicator = props => {
  const { 
    tweet
  } = props;
  return (
    <IndexIndicatorWrapper
      tweet={{ tweet: tweet }}
      data-tweet-id={tweet.tweetIdx}
      data-tweet={{ tweet: tweet }}
      onClick={e => {
        const selectedTweetEl = d3.select(e.target);
        if (selectedTweetEl.classed('tweet_index_indicator_highlighted') == false) {
          highlightSelectedTweet(true);
        } else {
          highlightSelectedTweet(false);
        }
        
        function highlightSelectedTweet(isHighlighted) {
          d3.select(e.target).classed('tweet_index_indicator_highlighted', isHighlighted);

          // for continous features (individual lines)
          const tweetLine = d3.selectAll('.tweet_line_' + tweet.tweetIdx).raise()
            .classed('tweet_line_highlighted', isHighlighted);

          // for categorical features (for aggregated line), go over selected features by looking at the feature titles
          const features = d3.selectAll('.feature_title_in_axis').data();
          features.forEach(function(feature, i) {
            if (features[i].type == 'categorical') {
              d3.selectAll('.aux_axis_for_cat_features_' + features[i].key + '_' + tweet[feature.key])
                .classed('aux_axis_highlighted', isHighlighted);
            }
            if (i < features.length-1) {
              const currFeatureValue = tweet[features[i].key],
                nextFeatureValue = tweet[features[i+1].key];

              if ((features[i].type == 'categorical') && (features[i+1].type == 'categorical')) {
                d3.select('.tweet_cat_line_' + currFeatureValue + '_' + nextFeatureValue + '.from_' + features[i].abbr + '.to_' + features[i+1].abbr)
                  .raise()
                  .classed('tweet_line_highlighted', isHighlighted);
              }
              
            }
            
          });

          // for line from feature to output
          const featureToOutputLine = d3.selectAll('.line_feature_to_output_' + tweet.tweetIdx).raise()
            .classed('tweet_line_highlighted', isHighlighted);

          // highilght the subgroup it belongs to
          const clusterIdsForTweets = d3.select('.cluster_plot_title').datum();
          const clusterIdForHighlightedTweet = tweet.clusterId;
          const clusterForHighlightedTweet = d3.select('.cluster_circle_' + clusterIdsForTweets[tweet.tweetIdx])
            .classed('cluster_for_highlighted', isHighlighted);
        }
      }}
    >{tweet.tweetIdx}
    </IndexIndicatorWrapper>
  );
}
const Document = props => {
  const { 
    tweet, 
    isSelected,
    features 
  } = props;
  const dispatch = useDispatch();
  if (typeof tweet === 'undefined' || Object.keys(tweet).length === 0)
    return <div />;

  return (
    <DocumentWrapper
      className={'doc_' + tweet.tweetIdx + (isSelected ? ' doc_selected ' : '')}
      tweet={tweet}
      data-tag={tweet}
      // style={isSelected ? { backgroundColor: '#dad9d9' } : {}}
    >
      <div
        className={'doc_' + tweet.tweetIdx}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <GroupDiv
          // style={{ borderWidth:  }}
          group={tweet.group}
          style={isSelected ? { opacity: 1 } : {}}
          onClick={e => {
            const classList = e.target.className.split(' ');
            const isSelected =
              classList.filter(d => d === 'doc_glyph_secon  xd_selected')
                .length !== 0;

            if (isSelected) {
              // to unselect
              d3.select(e.target)
                .style('border-width', '0px')
                .style('opacity', 0.5);
            } else {
              // to encode the selection


              // Cancel all effects
              d3.selectAll('.doc_glyph')
                .classed('.doc_glyph_selected', false)
                .style('opacity', 0.5)
                .style('border-width', '0px')
                .style('font-size', '0.8rem');

              d3.selectAll('.doc_selected')
                .classed('doc_selected', false)
                .style('background-color', 'white');

              // Adjust the effect to the selected tweet
              d3.select(e.target)
                .classed('doc_glyph_selected', true)
                .style('border-width', '2px')
                .style('opacity', 1);

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_selected', false)
                .style('background-color', 'white');

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_selected', true)
                .style('background-color', 'whitesmoke');
            }

            dispatch({
              type: 'SELECT_TWEET',
              payload: tweet
            });
          }}
          onContextMenu={e => {
            e.preventDefault();

            const classList = e.target.className.split(' ');
            const isSelected =
              classList.filter(d => d === 'second_selected').length !== 0;

            if (isSelected) {
            } else {
              // to encode the selection

              // Cancel all effects
              d3.selectAll('.doc_glyph')
                .classed('.doc_glyph_second_selected', false)
                .style('opacity', 0.5)
                .style('border-width', '0px')
                .style('font-size', '0.8rem');

              d3.selectAll('.doc_second_selected')
                .classed('doc_second_selected', false)
                .style('background-color', 'white');

              // Adjust the effect to the selected tweet
              d3.select(e.target)
                .classed('doc_glyph_second_selected', true)
                .style('border-width', '2px')
                .style('opacity', 1);

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_second_selected', false)
                .style('background-color', 'white');

              d3.select(e.target.parentNode.parentNode)
                .classed('doc_second_selected', true)
                .style('background-color', 'whitesmoke');
            }

            dispatch({
              type: 'SELECT_SECOND_TWEET',
              payload: tweet.tweetIdx
            });
          }}
        />
        <div>{tweet.screenName}</div>
        <ScoreView 
          tweet={tweet}
          features={features}
          onClick={e => { console.log('scoreview clicked: ', e.target) }}
        />
      </div>
      <div 
        className={'contentWrapper'}
        style={{ display: 'flex' }}>
        <ContentDiv>{tweet.content}</ContentDiv>
        <IndexIndicator 
          tweet={tweet}
        />
      </div>
    </DocumentWrapper>
  );
};

export default Document;

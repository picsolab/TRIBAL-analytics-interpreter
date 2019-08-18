import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

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
  width: 400,
  height: 200,
  leftMargin: 30,
  innerHeight: 340 - 2,
  wordPlot: {
    width: 400,
    height: 240,
    leftMargin: 10
  },
  wordGroupPlot: {
    width: 150,
    height: 150,
    leftMargin: 30
  }
};

const numFeatures = 6;

const WordPlotViewWrapper = styled(SectionWrapper).attrs({
  className: 'word_plot_view_wrapper'
})`
  grid-area: w;
  display: flex;
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
  width: ${layout.wordPlot.width / numFeatures + 'px'};
`;

const WordWrapper = styled.div.attrs({
  className: 'word_wrapper'
})`
  font-size: 0.7rem;

  height: 15px;
  border-radius: 5px;
  background-color: gray;
  color: white;
  text-align: center;
  display: inline-block;
  margin: 0 auto;
  padding: 0 3px;
`;

const WordGroupPlot = styled.div.attrs({
  className: 'word_group_plot_wrapper'
})``;

const WordPlotView = props => {
  const { words, selectedFeatures, globalMode } = props;
  const ref = useRef(null);
  //* For the word plot
  const filterWordsByFeature = feature => {
    const divWords = words
      .filter(d => d.fromFeature === feature)
      .map(d => <WordWrapper>{d.word}</WordWrapper>);

    return <WordListWrapper>{divWords}</WordListWrapper>;
  };

  useEffect(() => {
    //* For the word group view
    const svg = d3.select(ref.current);
  });

  return (
    <WordPlotViewWrapper>
      <WordPlotWrapper>
        {filterWordsByFeature('valence')}
        {filterWordsByFeature('dominance')}
        {filterWordsByFeature('dominance')}
        {filterWordsByFeature('harm')}
        {filterWordsByFeature('fairness')}
      </WordPlotWrapper>
      <WordGroupPlot>
        <svg
          // width={layout.width + layout.margin.left + layout.margin.right}
          // height={layout.height + layout.margin.top + layout.margin.bottom}
          width={layout.wordGroupPlot.width}
          height={layout.wordGroupPlot.height}
          // viewBox={
          //   '0 0 ' +
          //   layout.wordGroupPlot.width +
          //   ' ' +
          //   layout.wordGroupPlot.height
          // }
          // preserveAspectRatio="xMinYMin"
          ref={ref}
        />
      </WordGroupPlot>
    </WordPlotViewWrapper>
  );
};

export default WordPlotView;

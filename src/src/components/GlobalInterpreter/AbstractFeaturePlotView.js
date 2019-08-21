import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button, Select } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
  SectionWrapper,
  SectionTitle,
  SubsectionTitle,
  SubTitle
} from '../../GlobalStyles';

const AbstractFeaturePlotViewWrapper = styled(SectionWrapper).attrs({
  className: 'abstract_feature_plot_view_wrapper'
})`
  grid-area: ab;
`;

const AggregationBar = styled.div.attrs({
  className: 'aggregation_bar'
})`
  width: 350px;
  height: 5px;
  margin-top: 5px;
  margin-left: 20px;
  // border-bottom: 1px solid #6af1bf;
  background-color: white;
  border: white;
  border-radius: 3px;
`;

const layout = {
  margin: { top: 20, right: 110, bottom: 20, left: 30 },
  width: 400,
  height: 5,
  innerHeight: 340 - 2
};

const AbstractFeaturePlotView = ({ numAbstractFeatures, globalMode }) => {
  return (
    <div>
      <AggregationBar />
    </div>
  );
};

export default AbstractFeaturePlotView;

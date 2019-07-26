import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

const AbstractFeaturePlotViewWrapper = styled(SectionWrapper).attrs({
  className: 'abstract_feature_plot_view_wrapper'
})`
  grid-area: ab;
`;

const layout = {
  margin: { top: 20, right: 110, bottom: 20, left: 30 },
  width: 400,
  height: 200,
  innerHeight: 340 - 2
};

const AbstractFeaturePlotView = ({ numAbstractFeatures }) => {
  return <div>Emotion and Moral</div>;
};

export default AbstractFeaturePlotView;

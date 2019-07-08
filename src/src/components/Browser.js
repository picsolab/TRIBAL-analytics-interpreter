import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import CustomizedInputBase from './SearchBar';
import index from '../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionTitle, SubTitle } from '../GlobalStyles';

import RetrievalView from './RetrievalView';
import ListView from './ListView';

const BrowserWrapper = styled.div.attrs({
  className: 'RetrievalView'
})`
  grid-area: b;
`;

const Browser = ({ data }) => {
  return (
    <BrowserWrapper>
      <RetrievalView data={data} />
      <ListView data={data} />
    </BrowserWrapper>
  );
};

export default Browser;

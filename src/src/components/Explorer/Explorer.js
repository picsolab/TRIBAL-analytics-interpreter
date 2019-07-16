import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import CustomizedInputBase from '../subcomponents/SearchBar';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionTitle, SubTitle } from '../../GlobalStyles';

import RetrievalView from './RetrievalView';
import DocumentView from './DocumentView';
import ListView from './ListView';
import InstanceViewer from './InstanceViewer';

const ExplorerWrapper = styled.div.attrs({
  className: 'Explorer'
})`
  grid-area: e;
  display: grid;
  grid-template-rows: 150px 300px 600px;
  grid-template-columns: 40% 60%;
  grid-template-areas:
    'rt rt'
    'd l'
    'd i';
`;

const Explorer = ({ data }) => {
  console.log('data in explorer: ', data);
  return (
    <ExplorerWrapper>
      <RetrievalView data={data} />
      <DocumentView data={data} />
      <ListView data={data} />
      <InstanceViewer data={data} />
    </ExplorerWrapper>
  );
};

export default Explorer;

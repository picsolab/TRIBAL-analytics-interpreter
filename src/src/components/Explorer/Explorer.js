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

const ExplorerWrapper = styled.div.attrs({
  className: 'Explorer'
})`
  grid-area: e;
  display: grid;
  grid-template-rows: 150px 300px 600px;
  grid-template-columns: 60% 40%;
  grid-template-areas:
    'rt rt'
    'd l'
    'd l';
`;

const Explorer = ({ tweets, users }) => {
  console.log('tweets in explorer: ', tweets, users);
  const selectedTweet = tweets[0];
  return (
    <ExplorerWrapper>
      <RetrievalView data={tweets} />
      <DocumentView data={tweets} />
      <ListView users={users} />
    </ExplorerWrapper>
  );
};

export default Explorer;

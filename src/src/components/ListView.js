import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import CustomizedInputBase from './SearchBar';
import index from '../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SubTitle, SubTitle2 } from '../GlobalStyles';

import FeatureView from './FeatureView';

const ListViewWrapper = styled.div.attrs({
  className: 'list_view_wrapper'
})`
  display: grid;
  grid-template-rows: 50% 50%;
  grid-template-columns: 20% 50% 30%;
  grid-template-areas:
    'f dc u'
    'f dc w';
  height: 75%;
`;

const DocumentListWrapper = styled(SubTitle2).attrs({
  className: 'document_list'
})`
  grid-area: dc;
  border
`;

const UserListWrapper = styled(SubTitle2).attrs({
  className: 'user_list'
})`
  grid-area: u;
`;

const WordListWrapper = styled(SubTitle2).attrs({
  className: 'word_list'
})`
  grid-area: w;
`;

const ComponentSubTitle = styled(SubTitle)`
  background-color: darkgray;
  color: white;
`;

const ListView = ({ onIncrease, onDecrease, number }) => {
  const data = [0.7, 0.5, 0.3, 0.4];

  return (
    <ListViewWrapper>
      <FeatureView data={data} />
      <DocumentListWrapper>
        <ComponentSubTitle>Document</ComponentSubTitle>
      </DocumentListWrapper>
      <UserListWrapper>
        <ComponentSubTitle>User</ComponentSubTitle>
      </UserListWrapper>
      <WordListWrapper>
        <ComponentSubTitle>Word</ComponentSubTitle>
      </WordListWrapper>
    </ListViewWrapper>
  );
};

export default ListView;

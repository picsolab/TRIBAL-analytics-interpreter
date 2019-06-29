import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import CustomizedInputBase from './SearchBar';
import index from '../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SubTitle } from '../GlobalStyles';

const RetrievalViewWrapper = styled.div.attrs({
  className: 'RetrievalView' // something here
})`
  grid-area: rt;
`;

const LocalButton = styled(Button)`
  background-color: black;
`;

const SearchBarWrapper = styled.div.attrs({
  className: 'search_bar' // something here
})`
  width: 100%;
  height: 100px;
  display: flex;
  background-color: whitesmoke;
  margin: 5px;
  padding: 5px;
`;

const ComponentSubTitle = styled(SubTitle)`
  color: blue;
`;

const SearchComponentWrapper = styled.div.attrs({
  className: 'search_component_wrapper' // something here
})`
  width: 20%;
`;

const FeatureView = () => {
  const renderThings = () => {
    return <div>renderInside</div>;
  };

  return (
    <div>
      {renderThings()}
      <g />
    </div>
  );
};

const RetrievalView = ({ onIncrease, onDecrease, number }) => {
  return (
    <RetrievalViewWrapper>
      <SearchBarWrapper>
        <div className={index.subTitle}>Filter</div>
        <SearchComponentWrapper>
          <ComponentSubTitle>Word</ComponentSubTitle>
          <CustomizedInputBase />
        </SearchComponentWrapper>
        <SearchComponentWrapper>
          <div>Document</div>
        </SearchComponentWrapper>
        <SearchComponentWrapper>
          <div>User</div>
        </SearchComponentWrapper>
        <SearchComponentWrapper>
          <div>Group</div>
        </SearchComponentWrapper>
      </SearchBarWrapper>
      <h1>{number}</h1>
      <div>
        <LocalButton
          // className={styles.searchButton}
          style={{ marginTop: '10px' }}
          size="xsmall"
          type="submit"
          primary
          label="Search"
        />
        <button onClick={onDecrease}>-1</button>
      </div>
      <FeatureView />
    </RetrievalViewWrapper>
  );
};

export default RetrievalView;

import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import CustomizedInputBase from '../subcomponents/SearchBar';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import FeatureView from './FeatureView';
import ListView from './ListView';

const RetrievalViewWrapper = styled(SectionWrapper).attrs({
  className: 'RetrievalView'
})`
  grid-area: rt;
`;

const LocalButton = styled(Button)`
  background-color: black;
`;

const SearchBarWrapper = styled.div.attrs({
  className: 'search_bar_wrapper'
})`
  width: 95%;
  height: 70px;
  display: flex;
  padding: 5px;
  border-bottom: 0.5px solid #e6e6e6;
  background-color: whitesmoke;
`;

const ComponentSubTitle = styled(SubTitle)`
  color: black;
`;

const SearchComponentWrapper = styled.div.attrs({
  className: 'search_component_wrapper'
})`
  width: 20%;
  margin-left: 15px;
`;

// const FeatureView = () => {
//   const renderThings = () => {
//     return <div>renderInside</div>;
//   };

//   return (
//     <div>
//       {renderThings()}
//       <g />
//     </div>
//   );
// };

const RetrievalView = ({ onIncrease, onDecrease, number }) => {
  return (
    <RetrievalViewWrapper>
      <div style={{ display: 'flex' }}>
        <SectionTitle>Retrieval</SectionTitle>
      </div>
      <SearchBarWrapper>
        <div className={index.subTitle}>Filter</div>
        <SearchComponentWrapper>
          <ComponentSubTitle>Word</ComponentSubTitle>
          <CustomizedInputBase />
        </SearchComponentWrapper>
        <SearchComponentWrapper>
          <ComponentSubTitle>Document</ComponentSubTitle>
          <CustomizedInputBase />
        </SearchComponentWrapper>
        <SearchComponentWrapper>
          <ComponentSubTitle>User</ComponentSubTitle>
          <CustomizedInputBase />
        </SearchComponentWrapper>
        <SearchComponentWrapper>
          <ComponentSubTitle>Word</ComponentSubTitle>
          <CustomizedInputBase />
        </SearchComponentWrapper>
      </SearchBarWrapper>
      {/* <h1>{number}</h1>
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
      </div> */}
    </RetrievalViewWrapper>
  );
};

export default RetrievalView;

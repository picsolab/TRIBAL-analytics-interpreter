import React from 'react';
import styled from 'styled-components';

export const SectionWrapper = styled.div`
  padding: 5px;
  margin: 5px;
`;

export const SectionTitle = styled.div`
  padding: 5px;
  margin: 3px;
  border-bottom: 2px solid gray;
  font-size: 1rem;
  font-weight: 500;
`;

export const SubTitle = styled.div`
  font-weight: 500;
`;

export const SubTitle2 = styled.div`
  margin: 0 10px;
  // text-align: center;
`;

export const ComponentSubTitle = styled(SubTitle)`
  padding: 3px 0;
  // background-color: whitesmoke;
  // border: 0.5px solid black;
  // text-align: center;
`;

export const ListViewStyle = styled.div`
  height: 100%;
  padding: 3px 7px;
  background-color: whitesmoke;
`;

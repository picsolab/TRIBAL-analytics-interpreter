import React from 'react';
import styled from 'styled-components';

export const SectionTitle = styled.div`
  padding: 5px;
  margin: 3px;
  border: 2px solid gray;
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
  background-color: whitesmoke;
  border: 0.5px solid black;
  text-align: center;
`;

export const DocumentWrapper = styled.div.attrs({
  className: 'document'
})`
  display: flex;
  border: 1px solid gray;
  padding: 3px;
  margin: 2px 0;
`;

export const GroupDiv = styled.div.attrs({
  className: 'group'
})`
  width: 90px;
  line-height: 5;
  margin-right: 5px;
  background-color: skyblue;
  color: white;
  font-weight: 500;
  text-align: center;
`;

export const ScoreDiv = styled.div.attrs({
  className: 'score'
})`
  width: 33%;
`;

export const ContentDiv = styled.div.attrs({
  className: 'content'
})`
  padding: 3px;
  border-bottom: 1px solid gray;
  font-size: 0.8rem;
`;

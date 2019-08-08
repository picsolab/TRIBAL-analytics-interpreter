import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

export const globalColors = {
  group: {
    lib: 'darkblue',
    con: 'crimson'
  },
  feature: 'mediumslateblue',
  userFeature: 'lightpink'
};

export const SectionWrapper = styled.div`
  padding: 5px;
  margin: 5px;
`;

export const SectionTitle = styled.div`
  display: inline-block;
  padding: 5px;
  margin: 3px;
  border-bottom: 4px solid gray;
  font-size: 1rem;
  font-weight: 600;
`;

export const SubsectionTitle = styled.div.attrs({
  className: 'subsection_title'
})`
  display: inline-block;
  font-weight: 550;
  border-bottom: 2px solid gray;
  padding-bottom: 2px;
  margin: 10px 0;
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

export const Button1 = styled(Button)`
  background: mediumpurple;
  border: none;
  padding: 1px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  height: 25px;
  border-radius: 3px;
  margin-top: 15px;
  // margin-left: 5px;
`;

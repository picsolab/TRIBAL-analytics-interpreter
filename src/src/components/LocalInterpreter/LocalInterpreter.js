import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

const LocalInterpreterWrapper = styled(SectionWrapper).attrs({
  className: 'local_interpreter'
})`
  grid-area: l;
  display: grid;
  // grid-template-columns: 15% 85%;
  // grid-template-rows: 50px 50px 300px 100px;
  // grid-template-areas:
  //   't t'
  //   'ge ab'
  //   'ge f'
  //   'ge w';
`;

const LocalInterpreter = ({ tweets, clusters, words }) => {
  const numFeatures = 6,
    numAbstractFeatures = 1;

  return (
    <LocalInterpreterWrapper>
      <div>
        <SectionTitle>Local Interpretability</SectionTitle>
      </div>
    </LocalInterpreterWrapper>
  );
};

export default LocalInterpreter;

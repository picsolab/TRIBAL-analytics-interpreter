import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button, Select } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import Document from '../subcomponents/Document';

const LocalInterpreterWrapper = styled(SectionWrapper).attrs({
  className: 'local_interpreter'
})`
  grid-area: l;
  // display: grid;
  // grid-template-columns: 15% 85%;
  // grid-template-rows: 50px 50px 300px 100px;
  // grid-template-areas:
  //   't t'
  //   'ge ab'
  //   'ge f'
  //   'ge w';
`;

const QuestionWrapper = styled.div.attrs({
  className: 'question_wrapper'
})`
  width: 60%;
  height: 40px;
  line-height: 3;
  margin: 5px 0;
  padding-left: 15px;
  color: white;
  font-weight: 600;
  background-color: gray;
  border-radius: 5px;
`;

const ContrastiveExplanationWrapper = styled.div.attrs({
  className: 'contrastive_instances_wrapper'
})`
  display: flex;
  width: 60%;
  margin: 15px 0;
  padding: 5px 0;
  border-top: 3px solid gainsboro;
  border-bottom: 3px solid gainsboro;
`;

const SelectedInstanceWrapper = styled.div.attrs({
  className: 'selected_instance_wrapper'
})`
  width: 45%;
`;

const BetweenInstances = styled.div.attrs({
  className: 'between_instances'
})`
  width: 50px;
`;

const ContrastiveInstanceWrapper = styled.div.attrs({
  className: 'contrastive_instance_wrapper'
})`
  width: 45%;
`;

const AnswerWrapper = styled.div.attrs({
  className: 'answer_wrapper'
})`
  width: 60%;
  height: 40px;
  line-height: 3;
  margin: 5px 0;
  padding-left: 15px;
  font-weight: 600;
  background-color: lightgray;
  border-radius: 5px;
`;

const LocalInterpreter = ({ instance, qType }) => {
  return (
    <LocalInterpreterWrapper>
      <div>
        <SectionTitle>Local Interpretability</SectionTitle>
      </div>
      <span>Select a contrastive question type: </span>
      <Select
        multiple={true}
        value={qType}
        // onChange={}
        options={['p-mode', 'o-mode']}
        size={'xsmall'}
      />
      <QuestionWrapper>
        "Why tweet 176 classified as liberal than conservative?"
      </QuestionWrapper>
      <ContrastiveExplanationWrapper>
        <SelectedInstanceWrapper>
          <Document tweet={instance} />
        </SelectedInstanceWrapper>
        <BetweenInstances>{'< >'}</BetweenInstances>
        <ContrastiveInstanceWrapper>
          <Document tweet={instance} />
        </ContrastiveInstanceWrapper>
      </ContrastiveExplanationWrapper>
      <AnswerWrapper>Because tweet 176 has higher V and lower A</AnswerWrapper>
    </LocalInterpreterWrapper>
  );
};

export default LocalInterpreter;

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button, Select } from 'grommet';
import index from '../../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import Document from '../subcomponents/Document';

import { findContrastiveExamples } from '../../modules/localInterpreter';

const LocalInterpreterWrapper = styled(SectionWrapper).attrs({
  className: 'local_interpreter'
})`
  grid-area: l;
  border-left: 1px solid lightgray;
  margin-top: 10px;
  // display: grid;
  // grid-template-columns: 15% 85%;
  // grid-template-rows: 50px 50px 300px 100px;
  // grid-template-areas:
  //   't t'
  //   'ge ab'
  //   'ge f'
  //   'ge w';
`;

const IndicatorWrapper = styled.div.attrs({
  className: 'indicator_wrapper'
})`
  width: 20px;
  font-size: 1.2rem;
  font-weight: 600;
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

const QAView = ({ selectedTweet, qType, contrastiveEXs }) => {
  const answerStr = contrastiveEXs.map(
    d => d.subject + d.inequality + d.threshold
  );

  if (qType === 'p-mode')
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IndicatorWrapper>Q:</IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <QuestionWrapper>
            'Why '
            <Select
              multiple={true}
              value={selectedTweet.tweetId}
              // onChange={}
              options={[0, 1, 2, 3, 4, 5]}
              size={'xsmall'}
            />
            ' classified as liberal than conservative?'
          </QuestionWrapper>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IndicatorWrapper>A: </IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <AnswerWrapper>Because + {answerStr[0]}</AnswerWrapper>
        </div>
        <ContrastiveExplanationWrapper>
          <SelectedInstanceWrapper>
            <div>Selected</div>
            <Document tweet={selectedTweet} />
          </SelectedInstanceWrapper>
          <BetweenInstances>{'< >'}</BetweenInstances>
          <ContrastiveInstanceWrapper>
            <div>{contrastiveEXs[0].contFeature + '-contrastive'}</div>
            <div>{contrastiveEXs[0].contFeature + '-contrastive'}</div>
            <Document tweet={contrastiveEXs[0]} />
          </ContrastiveInstanceWrapper>
        </ContrastiveExplanationWrapper>
      </div>
    );
  else if (qType === 'o-mode')
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IndicatorWrapper>Q:</IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <QuestionWrapper>
            'Why '
            <Select
              multiple={true}
              value={selectedTweet.tweetId}
              // onChange={}
              options={[0, 1, 2, 3, 4, 5]}
              size={'xsmall'}
            />
            ' classified
            <Select
              multiple={true}
              value={selectedTweet.tweetId}
              // onChange={}
              options={[0, 1, 2, 3, 4, 5]}
              size={'xsmall'}
            />
            as liberal than conservative?'
          </QuestionWrapper>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IndicatorWrapper>A: </IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <AnswerWrapper>Because + {answerStr[0]}</AnswerWrapper>
        </div>
        <ContrastiveExplanationWrapper>
          <SelectedInstanceWrapper>
            <div>Selected</div>
            <Document tweet={selectedTweet} />
          </SelectedInstanceWrapper>
          <BetweenInstances>{'< >'}</BetweenInstances>
          <ContrastiveInstanceWrapper>
            <div>{contrastiveEXs[0].contFeature + '-contrastive'}</div>
            <div>{contrastiveEXs[0].contFeature + '-contrastive'}</div>
            <Document tweet={contrastiveEXs[0]} />
          </ContrastiveInstanceWrapper>
        </ContrastiveExplanationWrapper>
      </div>
    );
};

const LocalInterpreter = ({
  selectedTweet,
  tweets,
  qType,
  contrastiveEXs,
  currentModel
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      findContrastiveExamples({
        tweets: tweets,
        selectedTweet: selectedTweet,
        currentModel: currentModel
      })
    );
  }, [selectedTweet]);

  if (!contrastiveEXs || contrastiveEXs.length === 0) return <div />;

  return (
    <LocalInterpreterWrapper>
      <div>
        <SectionTitle>Local Interpretability</SectionTitle>
      </div>
      <span>Select a contrastive question type: </span>
      <Select
        multiple={false}
        value={qType}
        onChange={e => {
          dispatch({ type: 'CHANGE_QTYPE', payload: e.option });
        }}
        options={['p-mode', 'o-mode']}
        size={'small'}
      />
      <QAView
        qType={qType}
        selectedTweet={selectedTweet}
        contrastiveEXs={contrastiveEXs}
      />
    </LocalInterpreterWrapper>
  );
};

export default LocalInterpreter;

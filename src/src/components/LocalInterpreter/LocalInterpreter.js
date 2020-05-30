import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import {Spin, Icon} from 'antd';
import {Grommet, Button, Select} from 'grommet';
import {grommet} from 'grommet/themes';
import {deepMerge} from 'grommet/utils';
import index from '../../index.css';
import {StylesContext} from '@material-ui/styles/StylesProvider';
import {SectionWrapper, SectionTitle, SubsectionTitle, SubTitle, globalColors} from '../../GlobalStyles';

import Document from '../subcomponents/Document';

import {findContrastiveExamples} from '../../modules/localInterpreter';

const LocalInterpreterWrapper = styled(SectionWrapper).attrs({
  className: 'local_interpreter'
})`
  grid-area: l;
  // border-left: 1px solid lightgray;
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
  display: flex;
  flex-flow: wrap;
  align-items: center;
  width: 90%;
  line-height: 3;
  margin: 5px 0;
  padding: 5px 15px;
  color: white;
  font-weight: 600;
  background-color: gray;
  border-radius: 5px;
`;

const ContrastiveExplanationWrapper = styled.div.attrs({
  className: 'contrastive_instances_wrapper'
})`
  display: flex;
  width: 90%;
  margin: 15px 30px;
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
  align-self: center;

  text-align: center;
  font-weight: 600;
`;

const ContrastiveInstanceWrapper = styled.div.attrs({
  className: 'contrastive_instance_wrapper'
})`
  width: 45%;
`;

const CampIndicator = styled.div.attrs({
  className: 'camp_indicator'
})`
  height: 30px;
  padding: 0 5px;
  background-color: crimson;
  line-height: 2;
  border-radius: 5px;
`;

const AnswerWrapper = styled.div.attrs({
  className: 'answer_wrapper'
})`
  width: 90%;
  height: 40px;
  line-height: 3;
  margin: 5px 0;
  padding-left: 15px;
  font-weight: 600;
  background-color: lightgray;
  border-radius: 5px;
`;

const customDropdownTheme = {
  global: {
    background: 'white',
    font: {
      size: '10px'
    },
    extend: `
      width: 70%;
      background: 'white';
    `
  },
  select: {
    background: 'white',
    control: {
      extend: 'padding: 3px 6px;',
      open: {
        background: '#ece0fa',
        border: '1px solid #7D4CDB'
      }
    },
    container: {
      extend: `
      width: 100%;
    `,
      option: {
        text: {
          font: {
            color: 'blue',
            size: '10px'
          }
        },
        extent: `
          font-size: 0.4rem
        `,
        fontSize: '0.4rem'
      }
    }
  },
  options: {
    text: {
      fontSize: '10px',
      margin: 0,
      padding: 0
    }
  }
};

const QAView = ({
  selectedTweet,
  secondSelectedTweet,
  qType,
  contrastiveRules,
  contrastiveEXs,
  tweets,
  currentModelInfo,
  diffRule,
  features
}) => {
  const dispatch = useDispatch();
  /*
    contrastiveRule = { FEATURE-1: { 
      subject: 'contTweet' OR 'selectedTweet',
      inequality: '<' OR '>=',
      threshold: E.G., 0.5 
      },
      FEATURE-2: ...
    } 
  */

  const pTypeAnswerForFeatures = Object.keys(contrastiveRules).map((feature, idx) => {
    const subject = contrastiveRules[feature].subject;
    const inequality = contrastiveRules[feature].inequality;
    const andStr = idx !== Object.keys(contrastiveRules).length - 1 ? ' and' : '';

    var inequalityStr;
    // if (subject === 'selectedTweet') {
    //   if (inequality === '>' || inequality == '>=') inequalityStr = 'higher';
    //   else inequalityStr = 'lower';
    // } else if (subject === 'contTweet') {
    //   if (inequality === '>' || inequality == '>=') inequalityStr = 'lower';
    //   else inequalityStr = 'higher';
    // }
    if (inequality === '>' || inequality == '>=') inequalityStr = 'higher';
    else inequalityStr = 'lower';

    return inequalityStr + ' ' + feature + andStr;
  });

  const pTypeAnswerStr = 'tweet ' + selectedTweet.tweetIdx + ' has ' + pTypeAnswerForFeatures.join(' ');

  const {subject, feature, inequality, threshold} = diffRule;
  const firstSubjectStr = subject == 'first' ? 'tweet ' + selectedTweet.tweetIdx : 'tweet ' + secondSelectedTweet.tweetIdx;
  const secondSubjectStr = subject == 'first' ? 'tweet ' + secondSelectedTweet.tweetIdx : 'tweet ' + selectedTweet.tweetIdx;
  const inequalityStr = inequality === '>' ? 'higher' : 'lower';
  const oTypeAnswerStr = firstSubjectStr + ' has ' + inequalityStr + ' ' + feature + ' while ' + secondSubjectStr + ' does not';

  const idArray = _.range(0, 3097, 1),
    idWithTweetArray = idArray.map(id => <div style={{fontSize: '0.8rem'}}>{'tweet ' + id}</div>);

  if (qType === 'p-mode')
    return (
      <div>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <IndicatorWrapper>Q:</IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <QuestionWrapper>
            Why &nbsp;
            <Grommet theme={customDropdownTheme}>
              <Select
                style={{width: '100px', height: '10px', margin: '0 10px'}}
                multiple={true}
                value={'tweet ' + selectedTweet.tweetIdx}
                onChange={e => {
                  const selectedIdForFirstTweet = e.selected[0],
                    tweetForFirstTweet = tweets.filter(d => selectedIdForFirstTweet === d.tweetIdx)[0];

                  console.log('selectedIdForFirstTweet: ', selectedIdForFirstTweet);
                  dispatch({
                    type: 'SELECT_TWEET',
                    payload: tweetForFirstTweet
                  });
                  dispatch(
                    findContrastiveExamples({
                      qType: qType,
                      tweets: tweets,
                      selectedTweet: tweetForFirstTweet,
                      secondSelectedTweet: secondSelectedTweet,
                      currentModelInfo: currentModelInfo,
                      features: features
                    })
                  );
                }}
                options={idWithTweetArray}
                size={'small'}
              />
            </Grommet>
            &nbsp;
            {'classified as'}
            &nbsp;
            <CampIndicator
              style={{
                backgroundColor: selectedTweet.pred === '1' ? globalColors.group.lib : globalColors.group.con
              }}
            >
              {selectedTweet.pred === '1' ? 'blue camp' : 'red camp'}
            </CampIndicator>
            &nbsp;
            {' than '}
            &nbsp;
            <CampIndicator
              style={{
                backgroundColor: contrastiveEXs.length === 0 
                  ? globalColors.group.lib
                  : contrastiveEXs[0].pred === '1' 
                    ? globalColors.group.lib 
                    : globalColors.group.con
              }}
            >
              {contrastiveEXs.length === 0 
                ? 'blue camp'
                : contrastiveEXs[0].pred === '1' ? 'blue camp' : 'red camp'}
            </CampIndicator>{' '}
            &nbsp; ?
          </QuestionWrapper>
        </div>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <IndicatorWrapper>A: </IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <AnswerWrapper>Because {pTypeAnswerStr}</AnswerWrapper>
        </div>
        <ContrastiveExplanationWrapper>
          <SelectedInstanceWrapper>
            <div style={{fontSize: '0.8rem', fontWeight: 600}}>Selected</div>
            <Document 
              tweet={selectedTweet}
              features={features} 
            />
          </SelectedInstanceWrapper>
          <BetweenInstances>{'< >'}</BetweenInstances>
          <ContrastiveInstanceWrapper>
            {contrastiveEXs.map(contEX => (
              <div>
                <div style={{fontSize: '0.8rem', fontWeight: 600}}>{contEX.contFeature + '-contrastive example'}</div>
                <Document 
                  tweet={contEX}
                  features={features} />
              </div>
            ))}
          </ContrastiveInstanceWrapper>
        </ContrastiveExplanationWrapper>
      </div>
    );
  else if (qType === 'o-mode')
    return (
      <div>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <IndicatorWrapper>Q:</IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <QuestionWrapper>
            {/* first line of question */}
            <div style={{display: 'flex', alignItems: 'center'}}>
              Why &nbsp;
              <Grommet theme={customDropdownTheme}>
                <Select
                  style={{width: '80px', height: '10px', margin: '0 10px'}}
                  multiple={true}
                  value={'tweet ' + selectedTweet.tweetIdx}
                  onChange={e => {
                    const selectedIdForFirstTweet = e.selected[0],
                      tweetForFirstTweet = tweets.filter(d => selectedIdForFirstTweet === d.tweetIdx)[0];

                    console.log('selectedIdForFirstTweet: ', selectedIdForFirstTweet);
                    dispatch({
                      type: 'SELECT_TWEET',
                      payload: tweetForFirstTweet
                    });
                    dispatch(
                      findContrastiveExamples({
                        qType: qType,
                        tweets: tweets,
                        selectedTweet: tweetForFirstTweet,
                        secondSelectedTweet: secondSelectedTweet,
                        currentModelInfo: currentModelInfo,
                        features: features,
                        isCFLoading: true
                      })
                    );
                  }}
                  options={idWithTweetArray}
                  size={'small'}
                />
              </Grommet>
              &nbsp;
              {'classified as'}
              &nbsp;
              <CampIndicator
                style={{
                  backgroundColor: selectedTweet.pred === '1' ? globalColors.group.lib : globalColors.group.con
                }}
              >
                {selectedTweet.pred === '1' ? 'blue camp' : 'red camp'}
              </CampIndicator>
            </div>
            {/* second line of question */}
            <div style={{display: 'flex', alignItems: 'center'}}>
              &nbsp;&nbsp;
              {'while'}
              &nbsp;&nbsp;
              <Grommet theme={customDropdownTheme}>
                <Select
                  style={{width: '80px', height: '10px', margin: '0 10px'}}
                  multiple={true}
                  value={typeof secondSelectedTweet.tweetIdx != 'undefined' ? 'tweet ' + secondSelectedTweet.tweetIdx : ' '}
                  onChange={e => {
                    const selectedIdForSecondTweet = e.selected[0],
                      tweetForSecondTweet = tweets.filter(d => selectedIdForSecondTweet === d.tweetIdx)[0];

                    dispatch({
                      type: 'SELECT_SECOND_TWEET',
                      payload: tweetForSecondTweet.tweetIdx
                    });
                    dispatch(
                      findContrastiveExamples({
                        qType: qType,
                        tweets: tweets,
                        selectedTweet: selectedTweet,
                        secondSelectedTweet: tweetForSecondTweet,
                        currentModelInfo: currentModelInfo,
                        isCFLoading: true
                      })
                    );
                  }}
                  options={idWithTweetArray}
                  size={'small'}
                />
              </Grommet>
              &nbsp;&nbsp;
              {'classified as'}
              &nbsp;&nbsp;
              <CampIndicator
                style={{
                  backgroundColor:
                    secondSelectedTweet.pred === '1'
                      ? globalColors.group.lib
                      : secondSelectedTweet.pred === '0'
                      ? globalColors.group.con
                      : 'gray'
                }}
              >
                {secondSelectedTweet.pred === '1' ? 'blue camp' : secondSelectedTweet.pred === '0' ? 'red camp' : ' '}
              </CampIndicator>
              &nbsp; ?
            </div>
          </QuestionWrapper>
        </div>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <IndicatorWrapper>A: </IndicatorWrapper>&nbsp;&nbsp;&nbsp;
          <AnswerWrapper>Because {oTypeAnswerStr}</AnswerWrapper>
        </div>
        <ContrastiveExplanationWrapper>
          <SelectedInstanceWrapper>
            <div style={{fontSize: '0.8rem', fontWeight: 600}}>First</div>
            <Document 
              tweet={selectedTweet}
              features={features} 
            />
          </SelectedInstanceWrapper>
          <BetweenInstances>{'< >'}</BetweenInstances>
          <SelectedInstanceWrapper>
            <div style={{fontSize: '0.8rem', fontWeight: 600}}>Second</div>
            <Document 
              tweet={secondSelectedTweet}
              features={features} 
            />
          </SelectedInstanceWrapper>
        </ContrastiveExplanationWrapper>
      </div>
    );
};

const LocalInterpreter = ({
  selectedTweet,
  secondSelectedTweet,
  tweets,
  qType,
  contrastiveRules,
  contrastiveEXs,
  currentModelInfo,
  diffRule,
  features,
  isCFLoading
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(
    //   findContrastiveExamples({
    //     qType: qType,
    //     tweets: tweets,
    //     selectedTweet: selectedTweet,
    //     secondSelectedTweet: secondSelectedTweet,
    //     currentModel: currentModel,
    //     features: features
    //   })
    // );
    
  }, [selectedTweet]);

  const loadingIcon = <Icon type="loading" style={{fontSize: 24}} spin />;
  console.log('isCFLoading: ', isCFLoading);
  console.log('loading layout: ');
  if (isCFLoading === true)
    return (
      <LocalInterpreterWrapper>
        <div>
          <SubsectionTitle>Instance-level comparison</SubsectionTitle>
          <Spin indicator={loadingIcon} />
        </div>
        <span style={{fontWeight: 600}}>Select a contrastive question type: </span>
        &nbsp;
        <Select
          multiple={false}
          value={qType}
          onChange={e => {
            dispatch({type: 'CHANGE_QTYPE', payload: e.option});
          }}
          options={['p-mode', 'o-mode']}
          size={'small'}
        />
        <QAView
          qType={qType}
          selectedTweet={selectedTweet}
          secondSelectedTweet={secondSelectedTweet}
          contrastiveRules={contrastiveRules}
          contrastiveEXs={contrastiveEXs}
          diffRule={diffRule}
          tweets={tweets}
          currentModelInfo={currentModelInfo}
          features={features}
        />
      </LocalInterpreterWrapper>
    );
  
  console.log('selected tweet id: ', selectedTweet.tweetIdx, selectedTweet.pred, selectedTweet);
  console.log('contrastive tweet id: ', contrastiveEXs.pred, contrastiveEXs);
  console.log('contrastive rules: ', contrastiveRules);
  return (
    <LocalInterpreterWrapper>
      <div>
        <SubsectionTitle>Instance-level comparison</SubsectionTitle>
      </div>
      <span style={{fontWeight: 600}}>Select a contrastive question type: </span>
      &nbsp;
      <Select
        multiple={false}
        value={qType}
        onChange={e => {
          dispatch({type: 'CHANGE_QTYPE', payload: e.option});
        }}
        options={['p-mode', 'o-mode']}
        size={'small'}
      />
      <QAView
        qType={qType}
        selectedTweet={selectedTweet}
        secondSelectedTweet={secondSelectedTweet}
        contrastiveRules={contrastiveRules}
        contrastiveEXs={contrastiveEXs}
        diffRule={diffRule}
        tweets={tweets}
        currentModelInfo={currentModelInfo}
        features={features}
      />
    </LocalInterpreterWrapper>
  );
};

export default LocalInterpreter;

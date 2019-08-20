import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useForceUpdate from 'use-force-update';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import {
  Grommet,
  Button,
  Form,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  CheckBox
} from 'grommet';
import { grommet } from 'grommet/themes';
import { deepMerge } from 'grommet/utils';
import index from '../../index.css';
import {
  SectionWrapper,
  SectionTitle,
  SubsectionTitle,
  SubTitle,
  Button1
} from '../../GlobalStyles';

import { runDT } from '../../modules/tweet';
import globalInterpreter from '../../modules/globalInterpreter';

const GeneratorWrapper = styled(SectionWrapper).attrs({
  className: 'generator_wrapper'
})`
  grid-area: ge;
  height: 100%;
  border-right: 1px solid lightgray;
`;

const layout = {
  margin: { top: 20, right: 110, bottom: 20, left: 30 },
  width: 400,
  height: 200,
  innerHeight: 340 - 2
};

const customCheckBoxTheme = {
  checkBox: {
    size: '18px',
    // toggle: {
    //   extend: `
    //   font-size: 0.9rem;
    //   margin-right: 3px;
    // `
    // },
    icon: {
      size: '15px'
    },
    border: {
      width: '1px',
      extend: `
      font-size: 0.9rem;
      margin-right: 3px;
    `
    },
    gap: 'xsmall',
    extend: `
      font-size: 0.9rem;
      margin-right: 3px;
    `
  }
};

var currentlySelectedFeatures = ['valence', 'dominance', 'care', 'fairness'];

const Generator = props => {
  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();
  const {
    globalMode,
    tweets,
    tweetsWithPredFeatures,
    features,
    selectedFeatures
  } = props;

  // to be a props... updated by the layout below, then update states then come back as props

  const featureDivs = features.map(featureObj => (
    <div>
      <div />
      <Grommet theme={deepMerge(grommet, customCheckBoxTheme)}>
        <CheckBox
          checked={
            currentlySelectedFeatures.filter(e => e === featureObj.key).length
              ? true
              : false
          }
          label={featureObj.key}
          onChange={e => {
            e.target.checked
              ? currentlySelectedFeatures.push(featureObj.key)
              : _.remove(currentlySelectedFeatures, e => e === featureObj.key);
            forceUpdate();
          }}
        />
      </Grommet>
    </div>
  ));

  return (
    <GeneratorWrapper>
      <SubsectionTitle>Aggregate</SubsectionTitle>
      <div style={{ backgroundColor: '#beffe7', fontWeight: 600 }}>All</div>
      <div>Emotion</div>
      <div>Moral</div>
      <Form
        onSubmit={({ value }) => {
          const selectedTweetsByMode =
            globalMode === 2 ? tweetsWithPredFeatures : tweets;
          dispatch(
            runDT({
              tweets: selectedTweetsByMode,
              selectedFeatures: selectedFeatures
            })
          );
          dispatch({
            type: 'SET_SELECTED_FEATURES',
            payload: currentlySelectedFeatures.map(d => ({
              key: d,
              abbr: d.substring(0, 1).toUpperCase()
            }))
          });
        }}
      >
        {/* </Feature table> */}
        <SubsectionTitle>Features</SubsectionTitle>
        {featureDivs}
        {/* </FormField> */}
        <SubsectionTitle>Select a method</SubsectionTitle>
        <div style={{ backgroundColor: 'rgb(190, 255, 231)', fontWeight: 600 }}>
          Decision Tree
        </div>
        <div>Logistic Regression</div>
        <Button1
          style={{ marginTop: '10px' }}
          size="xsmall"
          type="submit"
          primary
          label="Run"
        />
      </Form>
    </GeneratorWrapper>
  );
};

export default Generator;

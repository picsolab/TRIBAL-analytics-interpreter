import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useForceUpdate from 'use-force-update';
import * as d3 from 'd3';
import _ from 'lodash';

import styled from 'styled-components';
import {
  Button,
  Form,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  CheckBox
} from 'grommet';
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

var currentlySelectedFeatures = [
  'valence',
  'arousal',
  'dominance',
  'moral1',
  'moral2',
  'moral3'
];
var isChecked = {
  valence: false,
  arousal: false
};

const setSelectedFeatures = (feature, checked) => {
  isChecked[feature]
    ? currentlySelectedFeatures.push(feature)
    : _.remove(currentlySelectedFeatures, d => d !== feature);

  isChecked[feature] = !checked;
};

const Generator = props => {
  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();
  const { tweets, features, selectedFeatures } = props;

  console.log('selectedFeatures: ', currentlySelectedFeatures);

  // to be a props... updated by the layout below, then update states then come back as props

  const featureDivs = features.map(featureObj => (
    <div>
      <CheckBox
        checked={
          currentlySelectedFeatures.filter(e => e === featureObj.key).length
            ? true
            : false
        }
        label={featureObj.key}
        onChange={e => {
          console.log(e.target.checked, featureObj.key);
          e.target.checked
            ? currentlySelectedFeatures.push(featureObj.key)
            : _.remove(currentlySelectedFeatures, e => e === featureObj.key);

          console.log('in onChange: ', currentlySelectedFeatures);
          forceUpdate();
        }}
      />
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
          // dispatch(
          //   runDT({ tweets: tweets, selectedFeatures: selectedFeatures })
          // );
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
        <div>Decision Tree</div>
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

import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button, Form } from 'grommet';
import index from '../../index.css';
import {
  SectionWrapper,
  SectionTitle,
  SubTitle,
  Button1
} from '../../GlobalStyles';

import { runDT } from '../../modules/dataLoader';

const GeneratorWrapper = styled(SectionWrapper).attrs({
  className: 'generator_wrapper'
})`
  grid-area: ge;
  height: 100%;
  border-right: 1px solid lightgray;
`;

const GeneratorSubTitle = styled.div.attrs({
  className: 'generator_subtitle'
})`
  display: inline-block;
  font-weight: 550;
  border-bottom: 2px solid gray;
  padding-bottom: 2px;
  margin: 10px 0;
`;

const layout = {
  margin: { top: 20, right: 110, bottom: 20, left: 30 },
  width: 400,
  height: 200,
  innerHeight: 340 - 2
};

const Generator = props => {
  const dispatch = useDispatch();
  const { tweets } = props;

  // to be a props... updated by the layout below, then update states then come back as props
  const selectedFeatures = ['valence', 'arousal', 'dominance'];

  return (
    <GeneratorWrapper>
      <GeneratorSubTitle>Aggregate</GeneratorSubTitle>
      <div>Emotion</div>
      <div>Moral</div>
      <GeneratorSubTitle>Select features</GeneratorSubTitle>
      <div>Valence</div>
      <div>Arousal</div>
      <div>Dominance</div>
      <div>Moral1</div>
      <div>Moral2</div>
      <div>Moral3</div>
      <GeneratorSubTitle>Select a method</GeneratorSubTitle>
      <div>Decision Tree</div>
      <Form
        onSubmit={({ value }) =>
          dispatch(
            runDT({ tweets: tweets, selectedFeatures: selectedFeatures })
          )
        }
      >
        {/* </FormField> */}
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

import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button, Form } from 'grommet';
import index from '../../index.css';
import { SectionWrapper, SectionTitle, SubTitle } from '../../GlobalStyles';

import { runDT } from '../../modules/globalInterpreter';

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

const Generator = props => {
  const dispatch = useDispatch();
  const { tweets } = props;

  const tweetsWithSelectedFeatures = tweets.map(d => ({
    valence: d.valence,
    arousal: d.arousal,
    dominance: d.dominance
  }));

  return (
    <GeneratorWrapper>
      <div>Aggregate</div>
      <div>Emotion</div>
      <div>Moral</div>
      <div>Select features</div>
      <div>Valence</div>
      <div>Arousal</div>
      <div>Dominance</div>
      <div>Moral1</div>
      <div>Moral2</div>
      <div>Moral3</div>
      <Form
        onSubmit={({ value }) =>
          dispatch(runDT({ features: tweetsWithSelectedFeatures }))
        }
      >
        {/* </FormField> */}
        <Button
          // className={styles.saveButton}
          style={{ marginTop: '10px' }}
          size="xsmall"
          type="submit"
          primary
          label="Save"
        />
      </Form>
    </GeneratorWrapper>
  );
};

export default Generator;

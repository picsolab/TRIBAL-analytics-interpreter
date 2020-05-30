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
  CheckBox
} from 'grommet';
import { grommet } from 'grommet/themes';
import { deepMerge } from 'grommet/utils';

import {
  TreeSelect,
  Table,
  Slider
} from 'antd';

import index from '../../index.css';
import {
  SectionWrapper,
  SectionTitle,
  SubsectionTitle,
  SubsubsectionTitle,
  SubTitle,
  Button1
} from '../../GlobalStyles';

import { runDT } from '../../modules/globalInterpreter';
import { runDTThenRunClandPD, fetchSeqs } from '../../modules/tweet';
import { flexbox } from '@material-ui/system';

const GeneratorWrapper = styled(SectionWrapper).attrs({
  className: 'generator_wrapper'
})`
  grid-area: ge;
  height: 100%;
  // border-bottom: 1px solid lightgray;
  // background: whitesmoke;
  margin-top: 0;
  display: flex;
  border-bottom: 1px solid whitesmoke;
  padding: 0 10px;
`;

const GroupDiv = styled.div.attrs({
  className: 'group_div'
})`
  width: 10px;
  height: 10px;
  line-height: 5;
  margin-right: 5px;
  border: 1px solid black;
  color: white;
  font-weight: 500;
  text-align: center;
  opacity: 0.5;
  cursor: pointer;
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

var currentlySelectedFeatures = ['valence', 'dominance', 'care', 'fairness', 'purity', 'authority', 'loyalty'];
var freqW = 1,
  lengthW = 1,
  rankingW = 1,
  probW = 1;

const Generator = props => {
  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();
  const {
    globalMode,
    goals,
    tweets,
    tweetsWithPredFeatures,
    features,
    selectedFeatures,
    groups
  } = props;

  // to be a props... updated by the layout below, then update states then come back as props
  //currentlySelectedFeatures = selectedFeatures.map(d => d.key);
  const featureDivs = selectedFeatures.map(featureObj => (
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

  const goalDivs = goals.map(goal => <div>{goal}</div>);

  const TreeNode = TreeSelect.TreeNode;
  const featureNames = features.map(feature => feature.key),
      selectedRowKeys = features
        .map((d, idx) => {
          if (currentlySelectedFeatures.includes(d.key)) 
            return (idx + 1).toString()
        });

  const featureSelectionColumns = [
    { title: 'Feature', dataIndex: 'featureName', key: 1, width: 100 }
  ];
  const dataFeatureTable = features.map((feature, idx) => {
    return {
      key: (idx + 1).toString(),
      featureName: feature.key
    }
  });
  const featureSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      const selectedFeatureNames = selectedRows.map(d => d.featureName);
      currentlySelectedFeatures = selectedFeatureNames;
      forceUpdate();
    },
    getCheckboxProps: record => {
      // console.log('selectedRowKeys: ', selectedRowKeys);
      // const isSelected = currentlySelectedFeatures.filter(d => d !== record.key);
      // return {
      //   disabled: isSelected.length === 0
      // };
    }
  };

  return (
    <GeneratorWrapper>
      {/* <SubsectionTitle>Aggregate</SubsectionTitle>
      <div style={{ backgroundColor: '#beffe7', fontWeight: 600 }}>All</div>
      <div>Emotion</div>
      <div>Moral</div> */}
      <div>
          <SubsectionTitle>Groups</SubsectionTitle>
          <div style={{ display: 'flex' }}>
            <GroupDiv style={{ background: 'red' }} />
            <div>Red</div>
          </div>
          <div style={{ display: 'flex' }}>
            <GroupDiv style={{ background: 'blue' }} />
            <div>Blue</div>
          </div>
      </div>
      <Form
        style={{ width: '300px', marginLeft: '60px' }}
        onSubmit={({ value }) => {
          // const selectedTweetsByMode =
          //   globalMode === 2 ? tweetsWithPredFeatures : tweets;
          // dispatch(
          //   runDT({
          //     tweets: selectedTweetsByMode,
          //     selectedFeatures: selectedFeatures
          //   })
          // );
          const selectedFeatures = [];
          currentlySelectedFeatures.forEach((selectedFeatureName) => {
            const selectedFeature = features.filter(feature => feature.key === selectedFeatureName)[0];
            selectedFeatures.push(selectedFeature);
          })
          dispatch({
            type: 'SET_SELECTED_FEATURES',
            payload: selectedFeatures
          });
          dispatch(
            runDTThenRunClandPD({
              tweets: tweets,
              selectedFeatures: selectedFeatures,
              modelId: '',
              groups: groups
            })
          );
        }}
      >
        {/* </Feature table> */}
        <SubsectionTitle>Features</SubsectionTitle>
        <TreeSelect
          // className={styles.featureSelector}
          showSearch
          // style={{ width: 100 }}
          value={currentlySelectedFeatures}
          dropdownStyle={{ maxHeight: 100, overflow: 'auto' }}
          placeholder="Please select"
          allowClear
          multiple
          treeDefaultExpandAll
          onChange={(selectedFeatures) => { 
            currentlySelectedFeatures = selectedFeatures;
            forceUpdate();
          }}
        >
          {features.map((feature, idx) => (
            <TreeNode value={feature.key} title={feature.key} key={idx} />
          ))}
        </TreeSelect>
        {/* <Table
          style={{ marginTop: '10px' }}
          rowSelection={featureSelection}
          columns={featureSelectionColumns}
          dataSource={dataFeatureTable}
          scroll={{ y: 250 }}
          pagination={false}
        /> */}
        
        <Button1
          style={{ marginTop: '10px' }}
          size="xsmall"
          type="submit"
          primary
          label="Run"
        />
      </Form>
      <div style={{ height: '5px' }} />
      <Form
        style={{ marginLeft: '60px' }}
        onSubmit={({ value }) => {
          dispatch(
            fetchSeqs({
              opt: 'dynamic',
              mode: 'all',
              tweetIds: tweets.map(d => d.tweetIdx),
              seqWeights: {
                post: probW,
                ranking: rankingW,
                length: lengthW,
                freq: freqW
              }
            })
          );
        }}
      >
        <SubsectionTitle>SEQUENCE</SubsectionTitle>
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '10px' }}>
            <div>
              <SubsubsectionTitle>Predictive impact</SubsubsectionTitle>
              <Slider 
                className={'ddd'}
                step={0.05} 
                min={0.5}
                max={1.5}
                value={rankingW}
                trackStyle={{ backgroundColor: 'mediumaquamarine', height: '5px' }}
                handleStyle={{ backgroundColor: 'mediumaquamarine', border: '2px solid white' }}
                style={{ width: '90%', margin: '5px 0' }}
                onChange={(rankingWeight) => { 
                  console.log('rankingWeight: ', rankingWeight);
                  rankingW = rankingWeight;
                  forceUpdate();
                }} 
              />
            </div>
            <div>
              <SubsubsectionTitle>Length</SubsubsectionTitle>
              <Slider 
                className={'ddd'}
                step={0.05} 
                min={0.5}
                max={1.5}
                value={lengthW}
                trackStyle={{ backgroundColor: 'mediumaquamarine', height: '5px' }}
                handleStyle={{ backgroundColor: 'mediumaquamarine', border: '2px solid white' }}
                style={{ width: '90%', margin: '5px 0' }}
                onChange={(lengthWeight) => { 
                  console.log('lengthWeight: ', lengthWeight);
                  lengthW = lengthWeight;
                  forceUpdate();
                }} 
              />
            </div>
          </div>
          <div>
            <div>
              <SubsubsectionTitle>Prevalence</SubsubsectionTitle>
              <Slider 
                className={'ddd'} 
                step={0.05} 
                min={0.5}
                max={1.5}
                value={freqW}
                trackStyle={{ backgroundColor: 'mediumaquamarine', height: '5px' }}
                handleStyle={{ backgroundColor: 'mediumaquamarine', border: '2px solid white' }}
                style={{ width: '90%', margin: '5px 0' }}
                onChange={(freqWeight) => { 
                  console.log('freqWeight: ', freqWeight);
                  freqW = freqWeight;
                  forceUpdate();
                }} 
              />
            </div>
            <div>
              <SubsubsectionTitle>Concept representativenss</SubsubsectionTitle>
              <Slider 
                className={'ddd'} 
                step={0.05} 
                min={0.5}
                max={1.5}
                value={probW}
                trackStyle={{ backgroundColor: 'mediumaquamarine', height: '5px' }}
                handleStyle={{ backgroundColor: 'mediumaquamarine', border: '2px solid white' }}
                style={{ width: '90%', margin: '5px 0' }}
                onChange={(probWeight) => { 
                  console.log('probWeight: ', probWeight);
                  probW = probWeight;
                  forceUpdate();
                }} 
              />
            </div>
          </div>
        </div>
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

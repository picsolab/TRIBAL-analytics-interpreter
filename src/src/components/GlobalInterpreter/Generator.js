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
  Table
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

var currentlySelectedFeatures = ['valence', 'dominance', 'care', 'fairness', 'purity', 'authority', 'loyalty'];

const Generator = props => {
  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();
  const {
    globalMode,
    goals,
    tweets,
    tweetsWithPredFeatures,
    features,
    selectedFeatures
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
      <Form
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
        <Table
          rowSelection={featureSelection}
          columns={featureSelectionColumns}
          dataSource={dataFeatureTable}
          scroll={{ y: 250 }}
          pagination={false}
        />
        
        <Button1
          style={{ marginTop: '30px' }}
          size="xsmall"
          type="submit"
          primary
          label="Run"
        />
      </Form>
      <div style={{ height: '30px' }} />
    </GeneratorWrapper>
  );
};

export default Generator;

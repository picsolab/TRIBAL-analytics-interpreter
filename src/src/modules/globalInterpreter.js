import axios from 'axios';
import {store} from '../index';
import * as d3 from 'd3';

const CAL_PD = 'CAL_PD';
const RUN_CL_N_CAL_PD_FOR_PDP_VALUES = 'RUN_CL_N_CAL_PD_FOR_PDP_VALUES';
const CHANGE_GLOBAL_MODE = 'CHANGE_GLOBAL_MODE';
const SET_SELECTED_FEATURES = 'SET_SELECTED_FEATURES';
const IS_CHECKED = 'IS_CHECKED';
const SHOW_SEQ_PLOT_FOR_CLUSTER = 'SHOW_SEQ_PLOT_FOR_CLUSTER';
const RUN_DT = 'RUN_DT';

export const runDT = ({tweets, selectedFeatures}) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/runDecisionTree/',
      data: JSON.stringify({
        tweets: tweets,
        selectedFeatures: selectedFeatures
      })
    }).then(res => {
      dispatch({type: 'RUN_DT', payload: res.data});
      dispatch({type: 'UPDATE_TWEETS_AFTER_RUNNING_ML', payload: res.data});
    });
  };
};

// Three modes:
// (1) calculate pd per every feature
// (2) calculate pd for a set of features (aggregation)
// (3) calculate pd for clustering => output: clusters
//  - It's not actually pd but just averaging the output probability for all features
export const calculatePartialDependence = ({tweets, features, modelId}) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/calculatePartialDependence/',
      data: JSON.stringify({
        modelId: modelId,
        features: features,
        tweets: tweets
      })
    }).then(res => {
      dispatch({type: 'CAL_PD', payload: res.data});
      dispatch({type: 'CAL_PD_FOR_TWEETS', payload: res.data}); // output probability
    });
  };
};

// initial value for state
const initialState = {
  goals: [ 
    { goal: 'emotion',
      relevantFeatures: [
        { key: 'valence' },
        { key: 'dominance' }
      ]
    },
    { goal: 'moral',
      relevantFeatures: [
        { key: 'fairness' },
        { key: 'care' },
        { key: 'loyalty' },
        { key: 'authority' },
        { key: 'purity' }
      ]
    }
  ],
  groups: [{idx: 0, name: 'conservative', abbr: 'con'}, {idx: 1, name: 'liberal', abbr: 'lib'}],
  features: [
    {
      key: 'valence',
      abbr: 'V',
      type: 'continuous',
      threshold: 0.5,
      values: [0, 0.2, 0.4, 0.6, 0.8, 1],
      scale: d3.scaleLinear(),
      pdScale: d3.scaleLinear(),
      domain: [0, 1]
    },
    {
      key: 'dominance',
      abbr: 'D',
      type: 'continuous',
      threshold: 0.5,
      values: [0, 0.2, 0.4, 0.6, 0.8, 1],
      scale: d3.scaleLinear(),
      pdScale: d3.scaleLinear(),
      domain: [0, 1]
    },
    {
      key: 'fairness',
      abbr: 'F',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    },
    {
      key: 'care',
      abbr: 'C',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}, {num: 3, category: 'both'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 3, 0, 1]
    },
    {
      key: 'loyalty',
      abbr: 'F',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    },
    {
      key: 'authority',
      abbr: 'A',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    },
    {
      key: 'purity',
      abbr: 'P',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    }
  ],
  selectedFeatures: [
    {
      key: 'valence',
      abbr: 'V',
      type: 'continuous',
      threshold: 0.5,
      values: [0, 0.2, 0.4, 0.6, 0.8, 1],
      scale: d3.scaleLinear(),
      pdScale: d3.scaleLinear(),
      domain: [0, 1]
    },
    {
      key: 'dominance',
      abbr: 'D',
      type: 'continuous',
      threshold: 0.5,
      values: [0, 0.2, 0.4, 0.6, 0.8, 1],
      scale: d3.scaleLinear(),
      pdScale: d3.scaleLinear(),
      domain: [0, 1]
    },
    {
      key: 'fairness',
      abbr: 'F',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    },
    {
      key: 'care',
      abbr: 'C',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}, {num: 3, category: 'both'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 3, 0, 1]
    },
    {
      key: 'loyalty',
      abbr: 'F',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    },
    {
      key: 'authority',
      abbr: 'A',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    },
    {
      key: 'purity',
      abbr: 'P',
      type: 'categorical',
      values: [{num: 0, category: 'none'}, {num: 1, category: 'virtue'}, {num: 2, category: 'vice'}],
      scale: d3.scaleBand(),
      pdScale: d3.scaleLinear(),
      domain: [2, 0, 1]
    }
  ],
  areFeaturesChecked: {valence: false},
  currentModel: 'dt_0',
  models: [
    // {
    //   id: 'dt_0',
    //   type: 'dt',
    //   features: {
    //     type: 'predicted', // true or predicted
    //     constructValues: ['valence', 'dominance']
    //   },
    //   target: {
    //     type: 'predicted'
    //   },
    //   modes: [{ name: 'mode-1', outputProbPlot: '', performance: '' }]
    // }
  ],
  pdpValues: [],
  pdpValuesForGroups: [],
  pdpValuesForCls: [],
  pdpValuesForClsGroups: [],
  globalMode: 1, // 1: true-true, 2: true-pred, 3: pred-pred, 4:
  isClusterSelected: false,
  tweetsInClusterForSeqPlot: []
};

// Reducers
const globalInterpreter = (state = initialState, action) => {
  switch (action.type) {
    // case RUN_DT:
    //   console.log('in the case of RUN_DT');
    //   return {
    //     ...state,
    //     data: action.payload
    //   };
    case CHANGE_GLOBAL_MODE:
      const updatedGlobalMode = action.payload;
      switch (updatedGlobalMode) {
        case 0: // true-true
          return {
            ...state,
            globalMode: action.payload
          };
        case 1: // predicted-true
          return {
            ...state,
            globalMode: action.payload
          };
        case 2: // predicted-predicted
          return {
            ...state,
            globalMode: action.payload
          };
        case 3: // predicted-predicted for DL
          return {
            ...state,
            globalMode: action.payload
          };
      }
    case SET_SELECTED_FEATURES:
      const selectedFeatures = action.payload;
      return {
        ...state,
        selectedFeatures: selectedFeatures
      };
    case IS_CHECKED:
      return {
        ...state,
        isValenceChecked: action.payload
      };
    case CAL_PD:
      console.log('pdpvalues0: ', action.payload.pdpValues);
      return {
        ...state,
        pdpValues: action.payload.pdpValues
      };
    // case RUN_CL_N_CAL_PD_FOR_PDP_VALUES:
    //   console.log('RUN_CL_N_CAL_PD_FOR_PDP_VALUES: ', action.payload);
    //   return {
    //     ...state,
    //     pdpValues: action.payload.pdpValues
    //   };
    case RUN_DT:
      return {
        ...state,
        currentModel: action.payload.modelId,
        modelId: action.payload.modelId,
        models: [
          ...state.models,
          {
            id: action.payload.modelId,
            features: action.payload.features,
            performance: action.payload.accuracy,
            mode: state.globalMode
          }
        ]
      };
    case RUN_CL_N_CAL_PD_FOR_PDP_VALUES:
      return {
        ...state,
        pdpValues: action.payload.pdpValues,
        pdpValuesForGroups: action.payload.pdpValuesForGroups,
        pdpValuesForCls: action.payload.pdpValuesForCls,
        pdpValuesForClsGroups: action.payload.pdpValuesForClsGroups
      };
    case SHOW_SEQ_PLOT_FOR_CLUSTER:
      return {
        ...state,
        isClusterSelected: action.payload.isClusterSelected,
        tweetsInClusterForSeqPlot: action.payload.tweetsInClusterForSeqPlot
      };
    default:
      return state;
  }
};

export default globalInterpreter;

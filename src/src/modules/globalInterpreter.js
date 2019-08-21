import axios from 'axios';
import { store } from '../index';

const CAL_PD = 'CAL_PD';
const RUN_CL_N_CAL_PD_FOR_PDP_VALUES = 'RUN_CL_N_CAL_PD_FOR_PDP_VALUES';
const CHANGE_GLOBAL_MODE = 'CHANGE_GLOBAL_MODE';
const SET_SELECTED_FEATURES = 'SET_SELECTED_FEATURES';
const IS_CHECKED = 'IS_CHECKED';
const SHOW_SEQ_PLOT_FOR_CLUSTER = 'SHOW_SEQ_PLOT_FOR_CLUSTER';
const RUN_DT = 'RUN_DT';

export const runDT = ({ tweets, selectedFeatures }) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/runDecisionTree/',
      data: JSON.stringify({
        tweets: tweets,
        selectedFeatures: selectedFeatures
      })
    }).then(res => {
      dispatch({ type: 'RUN_DT', payload: res.data });
      dispatch({ type: 'UPDATE_TWEETS_AFTER_RUNNING_ML', payload: res.data });
    });
  };
};

// Three modes:
// (1) calculate pd per every feature
// (2) calculate pd for a set of features (aggregation)
// (3) calculate pd for clustering => output: clusters
//  - It's not actually pd but just averaging the output probability for all features
export const calculatePartialDependence = ({ tweets, features, modelId }) => {
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
      dispatch({ type: 'CAL_PD', payload: res.data });
      dispatch({ type: 'CAL_PD_FOR_TWEETS', payload: res.data }); // output probability
    });
  };
};

// initial value for state
const initialState = {
  features: [
    { key: 'valence', abbr: 'V' },
    { key: 'dominance', abbr: 'D' },
    { key: 'care', abbr: 'C' },
    { key: 'fairness', abbr: 'F' }
  ],
  selectedFeatures: [
    {
      key: 'valence',
      abbr: 'V',
      type: 'continuous',
      threshold: 0.5
    },
    {
      key: 'fairness',
      abbr: 'F',
      type: 'categorical',
      values: [
        { num: 0, real: 'none' },
        { num: 1, real: 'virtue' },
        { num: 2, real: 'vice' },
        { num: 3, real: 'both' }
      ]
    },
    { key: 'dominance', abbr: 'D', type: 'continuous', threshold: 0.5 },
    {
      key: 'care',
      abbr: 'C',
      type: 'categorical',
      values: [
        { num: 0, real: 'none' },
        { num: 1, real: 'virtue' },
        { num: 2, real: 'vice' },
        { num: 3, real: 'both' }
      ]
    }
  ],
  areFeaturesChecked: { valence: false },
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
  pdpValuesForCon: [],
  pdpValuesForLib: [],
  pdpValuesForClusters: {},
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
      return {
        ...state,
        selectedFeatures: action.payload
      };
    case IS_CHECKED:
      return {
        ...state,
        isValenceChecked: action.payload
      };
    case CAL_PD:
      console.log('calculatePartialDependence state: ', state);
      console.log(
        'calculatePartialDependence payload: ',
        JSON.parse(action.payload.tweets)
      );
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
      var pdpValuesObj = {};
      var pdpValuesForConObj = {};
      var pdpValuesForLibObj = {};
      var pdpValuesForClustersObj = {};
      Object.keys(action.payload.pdpValuesForClusters).forEach(clusterId => {
        pdpValuesForClustersObj[clusterId] = {};

        Object.keys(
          action.payload.pdpValuesForClusters[clusterId]['all']
        ).forEach(feature => {
          const all = JSON.parse(
            action.payload.pdpValuesForClusters[clusterId]['all'][feature]
          );
          const con = JSON.parse(
            action.payload.pdpValuesForClusters[clusterId]['con'][feature]
          );
          const lib = JSON.parse(
            action.payload.pdpValuesForClusters[clusterId]['lib'][feature]
          );

          pdpValuesForClustersObj[clusterId] = {
            all: {
              ...pdpValuesForClustersObj[clusterId]['all'],
              [feature]: all
            },
            con: {
              ...pdpValuesForClustersObj[clusterId]['con'],
              [feature]: con
            },
            lib: {
              ...pdpValuesForClustersObj[clusterId]['lib'],
              [feature]: lib
            }
          };
        });
      });
      Object.keys(action.payload.pdpValues).forEach(feature => {
        pdpValuesObj[feature] = JSON.parse(action.payload.pdpValues[feature]);
        pdpValuesForConObj[feature] = JSON.parse(
          action.payload.pdpValuesForCon[feature]
        );
        pdpValuesForLibObj[feature] = JSON.parse(
          action.payload.pdpValuesForLib[feature]
        );
      });
      return {
        ...state,
        pdpValues: pdpValuesObj,
        pdpValuesForCon: pdpValuesForConObj,
        pdpValuesForLib: pdpValuesForLibObj,
        pdpValuesForClusters: pdpValuesForClustersObj
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

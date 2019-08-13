import axios from 'axios';

const CAL_PD = 'CAL_PD';
const RUN_CL_N_CAL_PD_FOR_PDP_VALUES = 'RUN_CL_N_CAL_PD_FOR_PDP_VALUES';
const CHANGE_GLOBAL_MODE = 'CHANGE_GLOBAL_MODE';
const SET_SELECTED_FEATURES = 'SET_SELECTED_FEATURES';
const IS_CHECKED = 'IS_CHECKED';

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
    { key: 'harm', abbr: 'H' },
    { key: 'fairness', abbr: 'F' }
  ],
  selectedFeatures: [
    { key: 'valence', abbr: 'V' },
    { key: 'dominance', abbr: 'D' },
    { key: 'harm', abbr: 'H' },
    { key: 'fairness', abbr: 'F' }
  ],
  areFeaturesChecked: { valence: false },
  currentModel: 'dt_0',
  models: [
    {
      id: 'dt_0',
      type: 'dt',
      features: {
        type: 'predicted', // true or predicted
        constructValues: ['valence', 'dominance']
      },
      target: {
        type: 'predicted'
      }
    }
    // And all the predictions and clusters???
  ],
  pdpValues: [],
  globalMode: 0 // 1: true-true, 2: true-pred, 3: pred-pred, 4:
};

// Reducers
const globalInterpreter = (state = initialState, action) => {
  console.log('state: ', state);
  console.log('action: ', action);
  switch (action.type) {
    // case RUN_DT:
    //   console.log('in the case of RUN_DT');
    //   return {
    //     ...state,
    //     data: action.payload
    //   };
    case CHANGE_GLOBAL_MODE:
      console.log('in CHANGE_GLOBAL_MODE', action.payload);
      return {
        ...state,
        globalMode: action.payload
      };
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
    case RUN_CL_N_CAL_PD_FOR_PDP_VALUES:
      console.log(
        'in the case of RUN_CL_N_CAL_PD_FOR_PDP_VALUES: ',
        action.payload.pdpValues
      );
      var pdpValues_obj = {};
      Object.keys(action.payload.pdpValues).forEach(feature => {
        pdpValues_obj[feature] = JSON.parse(action.payload.pdpValues[feature]);
      });
      return {
        ...state,
        pdpValues: pdpValues_obj
      };
    default:
      console.log('dddddddd: ', state);
      return state;
  }
};

export default globalInterpreter;

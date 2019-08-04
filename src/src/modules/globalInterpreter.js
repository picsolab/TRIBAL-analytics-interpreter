import axios from 'axios';

const CAL_PD = 'CAL_PD';
const RUN_CL_N_CAL_PD_FOR_PDP_VALUES = 'RUN_CL_N_CAL_PD_FOR_PDP_VALUES';

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
      dispatch({ type: 'CAL_PD_FOR_TWEETS', payload: res.data });
    });
  };
};

// initial value for state
const initialState = {
  selectedFeatures: [
    'valence',
    'arousal',
    'dominance',
    'moral1',
    'moral2',
    'moral3'
  ],
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
  pdpValues: []
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
    case RUN_CL_N_CAL_PD_FOR_PDP_VALUES:
      return {
        ...state,
        pdpValues: action.payload.pdpValues
      };
    default:
      console.log('dddddddd: ', state);
      return state;
  }
};

export default globalInterpreter;

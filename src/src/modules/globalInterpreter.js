import axios from 'axios';

const CAL_PD = 'CAL_PD';

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
      console.log('res: ', res);
      dispatch({ type: 'CAL_PD', payload: JSON.parse(res.data) });
    });
  };
};

// initial value for state
const initialState = {
  data: [],
  selectedFeatures: ['valence', 'arousal', 'dominance'],
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
  pdResult: {}
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
      return {
        ...state,
        pdResult: action.payload
      };
    default:
      console.log('dddddddd: ', state);
      return state;
  }
};

export default globalInterpreter;

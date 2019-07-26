import axios from 'axios';

// Action type
const RUN_DT = 'RUN_DT';

// Action functions
export const runDT = ({ features }) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/runDecisionTree/',
      data: JSON.stringify(features)
    }).then(res => {
      dispatch({ type: 'RUN_DT', payload: res });
    });
  };
};

// initial value for state
const initialState = {
  data: []
};

// Reducers
const globalInterpreter = (state = initialState, action) => {
  console.log('state: ', state);
  console.log('action: ', action);
  switch (action.type) {
    case RUN_DT:
      console.log('in the case of FETCH_TWEETS');
      return action.payload;
    default:
      console.log('in the case of default: ', state);
      return state.data;
  }
};

export default globalInterpreter;

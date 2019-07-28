import axios from 'axios';

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
      console.log('in the case of RUN_DT');
      return action.payload;
    default:
      console.log('in the case of default: ', state);
      return state.data;
  }
};

export default globalInterpreter;

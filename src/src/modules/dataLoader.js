import { loadData } from '../dataHandling';

// Action type
const FETCH = 'dataLoader/FETCH';
const DECREMENT = 'counter/DECREMENT';

// Action generation functions
export const fetch = () => ({ type: FETCH });
export const decrement = () => ({ type: DECREMENT });

// initial value for state
const initialState = {
  data: require('../data/tweet_guncontrol_combined_simple.json')
};

// Reducers
const dataLoader = (state = initialState, action) => {
  switch (action.type) {
    case FETCH:
      return state.data;
    case DECREMENT:
      return state.data;
    default:
      return state.data;
  }
};

export default dataLoader;

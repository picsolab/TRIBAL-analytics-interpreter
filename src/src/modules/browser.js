import { loadData } from '../dataHandling';

// Action type
const INCREMENT = 'counter/INCREMENT';
const DECREMENT = 'counter/DECREMENT';

// Action generation functions
export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });

// initial value for state
const initialState = {
  data: require('../data/tweet_guncontrol.json'),
  count: 0
};

// Reducers
const browser = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT:
      return state.data;
    case DECREMENT:
      return state.data;
    default:
      return state.data;
  }
};

export default browser;

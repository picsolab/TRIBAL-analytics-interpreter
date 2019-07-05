import { loadData } from '../dataHandling';

const data1 = require('../data/tweet_guncontrol.json');

// Action type
const INCREMENT = 'counter/INCREMENT';
const DECREMENT = 'counter/DECREMENT';

// Action generation functions
export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });

// initial value for state
const initialState = {
  data: data1,
  count: 0
};

// Reducers
const retrievalView = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT:
      return state;
    case DECREMENT:
      return state;
    default:
      return state;
  }
};

export default retrievalView;

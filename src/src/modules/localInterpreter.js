import axios from 'axios';

// Action type
const CHANGE_QTYPE = 'CHANGE_QTYPE';

// initial value for state
const initialState = {
  qType: 'p-mode',
  instance: {
    grp: 'con',
    id: 737000000000000000,
    content:
      "A singer killed at a meet &amp; greet, and then 50 people are murdered at a nightclub and yet some people still think we don't need gun control",
    screenName: 'sunnshinecoast',
    userId: 4847697913,
    numFollowers: 100,
    numFriends: 118,
    numTweets: 1542,
    numRetweeted: 4074205,
    botScore: 'N/A',
    valence: 0.215672608,
    dominance: 0.801444548,
    harm: 0.988902207,
    fairness: 0.415014834
  }
};

// Reducers
const localInterpreter = (state = initialState, action) => {
  console.log('state: ', state);
  console.log('action: ', action);
  switch (action.type) {
    case CHANGE_QTYPE:
      console.log('in the case of CHANGE_QTYPE');
      return {
        ...state,
        qType: action.payload
      };
    default:
      console.log('in the case of default in localinterpreter: ', state);
      return state;
  }
};

export default localInterpreter;

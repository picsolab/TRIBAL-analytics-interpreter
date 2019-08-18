import axios from 'axios';

// Action type
const CHANGE_QTYPE = 'CHANGE_QTYPE';
const FIND_CONTRA_EX = 'FIND_CONTRA_EX';

export const findContrastiveExamples = ({
  selectedTweet,
  tweets,
  features,
  currentModel
}) => {
  return async dispatch => {
    console.log('in findContrastiveExamples: ', tweets);
    await axios({
      method: 'post',
      url: '/tweets/findContrastiveExamples/',
      data: JSON.stringify({
        selectedTweet: selectedTweet,
        modelId: currentModel,
        features: features,
        tweets: tweets,
        currentModel: currentModel
      })
    }).then(res => {
      dispatch({ type: 'FIND_CONTRA_EX', payload: res.data });
    });
  };
};

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
  },
  contrastiveEXs: []
};

// Reducers
const localInterpreter = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_QTYPE:
      return {
        ...state,
        qType: action.payload
      };
    case FIND_CONTRA_EX:
      return {
        ...state,
        contrastiveEXs: action.payload
      };
    default:
      return state;
  }
};

export default localInterpreter;

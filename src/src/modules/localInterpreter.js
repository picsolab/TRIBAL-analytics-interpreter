import axios from 'axios';

// Action type
const CHANGE_QTYPE = 'CHANGE_QTYPE';
const SELECT_SECOND_TWEET = 'SELECT_SECOND_TWEET';
const FIND_CONTRA_EX = 'FIND_CONTRA_EX';
const IS_CF_LOADING = 'IS_CF_LOADING';

export const findContrastiveExamples = ({
  qType,
  selectedTweet,
  secondSelectedTweet,
  tweets,
  features,
  currentModelInfo
}) => {
  return async dispatch => {
    const request_str = JSON.stringify({
      qType: qType,
      selectedTweet: selectedTweet,
      secondSelectedTweet: secondSelectedTweet,
      modelId: currentModelInfo.id,
      features: features,
      tweets: tweets,
      currentModelInfo: currentModelInfo
    });

    dispatch({ 
      type: 'IS_CF_LOADING', 
      payload: true 
    });
    await axios({
      method: 'post',
      url: '/tweets/findContrastiveExamples/',
      data: JSON.stringify({
        qType: qType,
        selectedTweet: selectedTweet,
        secondSelectedTweet: secondSelectedTweet,
        modelId: currentModelInfo.id,
        features: features,
        tweets: tweets,
        currentModelInfo: currentModelInfo
      })
    }).then(res => {
      dispatch({ type: 'FIND_CONTRA_EX', payload: res.data });
      // dispatch({ type: 'IS_CF_LOADING', payload: false });
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
    care: 0.988902207,
    fairness: 0.415014834
  },
  contrastiveRules: [],
  contrastiveEXs: [],
  diffRule: '',
  isCFLoading: false  // CF == CounterFactual
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
      const qType = action.payload.qType;
      const updatedState =
        qType === 'p-mode'
          ? {
              ...state,
              selectedTweet: action.payload.selectedTweet,
              contrastiveRules: action.payload.contRules,
              contrastiveEXs: action.payload.contExamples,
              isCFLoading: false
            }
          : {
              // for 'o-mode'
              ...state,
              selectedTweet: action.payload.selectedTweet,
              secondSelectedTweet: action.payload.secondSelectedTweet,
              diffRule: action.payload.diffRule,
              isCFLoading: false
            };
      return updatedState;
    case IS_CF_LOADING:
      return {
        ...state,
        isCFLoading: action.payload
      }
    default:
      return state;
  }
};

export default localInterpreter;

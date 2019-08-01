import axios from 'axios';

// Action type
const FETCH_TWEETS = 'FETCH_TWEETS';
const RUN_DT = 'RUN_DT';

// Action functions
export const fetchTweets = () => {
  return async dispatch => {
    await axios.get('/tweets/loadData').then(res => {
      const data = res.data.map(d => ({
        group: d.grp,
        content: d.content,
        valence: d.valence,
        arousal: d.arousal,
        dominance: d.dominance,
        moral1: d.moral1,
        moral2: d.moral2,
        moral3: d.moral3,
        userId: d.user_id,
        screenName: d.screen_name,
        numFollowers: d.num_followers,
        numFriends: d.num_friends,
        numRetweeted: d.num_retweeted,
        numTweets: d.num_tweets,
        botScore: d.bot_score
      }));
      dispatch({ type: 'FETCH_TWEETS', payload: data });
    });
  };
};

export const runDT = ({ tweets, selectedFeatures }) => {
  return async dispatch => {
    console.log('in useEffect');
    await axios({
      method: 'post',
      url: '/tweets/runDecisionTree/',
      data: JSON.stringify({
        tweets: tweets,
        selectedFeatures: selectedFeatures
      })
    }).then(res => {
      dispatch({ type: 'RUN_DT', payload: res.data });
    });
  };
};

// initial value for state
const initialState = {
  tweets: []
};

// Reducers
const dataLoader = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TWEETS:
      return {
        ...state,
        tweets: action.payload
      };
    case RUN_DT:
      console.log('action.payload in RUN_DT: ', action.payload);
      return {
        ...state,
        currentModel: action.payload.modelId,
        modelId: action.payload.modelId,
        tweets: JSON.parse(action.payload.tweets)
      };
    default:
      return state;
  }
};

export default dataLoader;

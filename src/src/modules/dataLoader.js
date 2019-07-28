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
    await axios({
      method: 'post',
      url: '/tweets/runDecisionTree/',
      data: JSON.stringify({
        tweets: tweets,
        selectedFeatures: selectedFeatures
      })
    }).then(res => {
      console.log('res: ', res);
      dispatch({ type: 'RUN_DT', payload: JSON.parse(res.data) });
    });
  };
};

// initial value for state
const initialState = {
  tweets: []
};

// Reducers
const dataLoader = (state = initialState, action) => {
  console.log('state: ', state);
  console.log('action: ', action);
  switch (action.type) {
    case FETCH_TWEETS:
      console.log('in the case of FETCH_TWEETS');
      return {
        ...state,
        tweets: action.payload
      };
    case RUN_DT:
      console.log('in the case of RUN_DT');
      console.log(action.payload);
      return {
        ...state,
        tweets: action.payload
      };
    default:
      console.log('in the case of default in dataLoader: ', state);
      return state;
  }
};

export default dataLoader;

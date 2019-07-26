import { loadData } from '../dataHandling';
import axios from 'axios';

// Action type
const FETCH_TWEETS = 'FETCH_TWEETS';

// Action functions
export const fetchTweets = () => {
  return async dispatch => {
    await axios.get('/tweets/loadData').then(res => {
      const data = res.data.map(d => ({
        grp: d.grp,
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

// initial value for state
const initialState = {
  data: []
};

// Reducers
const dataLoader = (state = initialState, action) => {
  console.log('state: ', state);
  console.log('action: ', action);
  switch (action.type) {
    case FETCH_TWEETS:
      console.log('in the case of FETCH_TWEETS');
      return action.payload;
    default:
      console.log('in the case of default: ', state);
      return state.data;
  }
};

export default dataLoader;

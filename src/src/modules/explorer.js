import axios from 'axios';

// Action type

// Action generation functions
export const searchTweets = ({ searchKeyword }) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/searchTweets/',
      data: JSON.stringify({
        searchKeyword: searchKeyword
      })
    }).then(res => {
      const tweets = res.data.map(d => ({
        tweetId: d.tweet_id,
        group: d.grp,
        content: d.content,
        valence: d.valence,
        dominance: d.dominance,
        harm: d.harm,
        fairness: d.fairness,
        userId: d.user_id,
        screenName: d.screen_name
      }));

      dispatch({ type: 'SEARCH_TWEETS', payload: tweets });
    });
  };
};

// initial value for state
const initialState = {
  data: require('../data/tweet_guncontrol_combined_simple.json'),
  count: 0,
  searchKeyword: ''
};

// Reducers
const explorer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default explorer;

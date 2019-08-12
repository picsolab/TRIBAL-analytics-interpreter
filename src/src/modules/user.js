import axios from 'axios';

// Action type
const FETCH_USERS = 'FETCH_USERS';

export const fetchUsers = () => {
  return async dispatch => {
    await axios.get('/tweets/loadUsers').then(res => {
      const data = res.data.map(d => ({
        screenName: d.screen_name,
        numFollowers: d.num_followers,
        numFriends: d.num_friends,
        numTweets: d.num_tweets,
        numRetweeted: d.num_retweeted,
        numTweetsInDataset: d.num_tweets_in_dataset,
        libRatio: d.lib_ratio
      }));
      dispatch({ type: 'FETCH_USERS', payload: data });
    });
  };
};

// initial value for state
const initialState = {
  users: [],
  userList: []
};

// Reducers
const user = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS:
      console.log('action.payload in FETCH_USERS: ', action.payload);
      return {
        ...state,
        users: action.payload,
        userList: action.payload.slice(0, 20)
      };
    default:
      return state;
  }
};

export default user;

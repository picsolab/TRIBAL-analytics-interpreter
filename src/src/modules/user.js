import axios from 'axios';

// Action type
const FETCH_USERS = 'FETCH_USERS';
const SELECT_USER = 'SELECT_USER';

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
  userList: [],
  selectedUser: {}
};

// Reducers
const user = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS:
      return {
        ...state,
        users: action.payload,
        userList: action.payload.slice(0, 20)
      };
    case SELECT_USER:
      return {
        ...state,
        selectedUser: action.payload
      };
    default:
      return state;
  }
};

export default user;

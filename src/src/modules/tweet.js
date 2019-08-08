import { runClusteringAndPartialDependenceForClusters } from './cluster';

import axios from 'axios';

// Action type
const FETCH_TWEETS = 'FETCH_TWEETS';
const SELECT_TWEET = 'SELECT_TWEET';
const RUN_DT = 'RUN_DT';
const CAL_PD_FOR_TWEETS = 'CAL_PD_FOR_TWEETS';
const RUN_CLUSTERING_FOR_TWEETS = 'RUN_CLUSTERING_FOR_TWEETS';
const RUN_CL_N_CAL_PD_FOR_TWEETS = 'RUN_CL_N_CAL_PD_FOR_TWEETS';

// Action functions
export const fetchTweets = () => {
  return async dispatch => {
    await axios.get('/tweets/loadData').then(res => {
      const tweets = res.data.map(d => ({
        group: d.grp,
        content: d.content,
        valence: d.valence,
        arousal: d.arousal,
        dominance: d.dominance,
        moral1: d.moral1,
        moral2: d.moral2,
        moral3: d.moral3,
        userId: d.user_id,
        screenName: d.screen_name
      }));

      const tweetsWithPredFeatures = res.data.map(d => ({
        group: d.grp,
        content: d.content,
        valence: d.valence,
        arousal: d.arousal,
        dominance: d.dominance,
        moral1: d.moral1,
        moral2: d.moral2,
        moral3: d.moral3,
        userId: d.user_id,
        screenName: d.screen_name
      }));

      dispatch({
        type: 'FETCH_TWEETS',
        payload: {
          tweets: tweets,
          tweetsWithPredFeatures: tweetsWithPredFeatures
        }
      });
    });
  };
};

export const runDT = ({ tweets, selectedFeatures }) => {
  return async dispatch => {
    console.log('in RUN_DT');
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

export function runDTThenRunClandPD({ tweets, selectedFeatures, modelId }) {
  // Again, Redux Thunk will inject dispatch here.
  // It also injects a second argument called getState() that lets us read the current state.
  return (dispatch, getState) => {
    // Remember I told you dispatch() can now handle thunks?
    return dispatch(
      runDT({ tweets: tweets, selectedFeatures: selectedFeatures })
    ).then(() => {
      // Assuming this is where the fetched user got stored
      console.log('getState in runDTCL: ', getState());
      const fetchedTweets = getState().tweet.tweets;
      // And we can dispatch() another thunk now!
      return dispatch(
        runClusteringAndPartialDependenceForClusters({
          tweets: fetchedTweets,
          features: selectedFeatures,
          modelId: modelId
        })
      );
    });
  };
}

// initial value for state
const initialState = {
  tweets: [],
  tweetsWithPredFeatures: [],
  selectedTweet: [],
  isLoaded: false
};

// Reducers
const tweet = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TWEETS:
      console.log('action.payload in FETCH_TWEETS: ', action.payload);
      return {
        ...state,
        tweets: action.payload.tweets,
        tweetsWithPredFeatures: action.payload.tweetsWithPredFeatures,
        selectedTweet: action.payload.tweets[0]
      };
    case SELECT_TWEET:

    case RUN_DT:
      console.log('action.payload in RUN_DT: ', action.payload);
      return {
        ...state,
        currentModel: action.payload.modelId,
        modelId: action.payload.modelId,
        tweets: JSON.parse(action.payload.tweets)
      };
    case CAL_PD_FOR_TWEETS:
      console.log('cal_pd_for_tweets');
    case RUN_CLUSTERING_FOR_TWEETS:
      console.log('RUN_CLUSTERING_FOR_TWEETS: ', action.payload);
      return {
        ...state,
        tweets: JSON.parse(action.payload.tweets)
      };
    case RUN_CL_N_CAL_PD_FOR_TWEETS:
      console.log('RUN_CL_N_CAL_PD_FOR_TWEETS: ', action.payload);
      const updatedTweets = state.tweets.map((d, i) => ({
        ...d,
        pdpValue: action.payload.pdpValues[i],
        clusterId: action.payload.clusterIdsForTweets[i]
      }));
      console.log('RUN_CL_N_CAL_PD_FOR_TWEETS: ', updatedTweets);
      return {
        ...state,
        tweets: updatedTweets,
        isLoaded: true
      };
    default:
      return state;
  }
};

export default tweet;

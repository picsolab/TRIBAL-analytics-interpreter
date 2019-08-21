import _ from 'lodash';
import { runClusteringAndPartialDependenceForClusters } from './cluster';
import { runDT } from './globalInterpreter';

import axios from 'axios';

// Action type
const FETCH_TWEETS = 'FETCH_TWEETS';
const UPDATE_TWEETS_ON_CHANGING_GLOBAL_MODE =
  'UPDATE_TWEETS_ON_CHANGING_GLOBAL_MODE';
const SELECT_TWEET = 'SELECT_TWEET';
const SELECT_SECOND_TWEET = 'SELECT_SECOND_TWEET';
const SEARCH_TWEETS = 'SEARCH_TWEETS';
const SORT_TWEETS_BY_FEATURE = 'SORT_TWEETS_BY_FEATURE';
const FILTER_TWEETLIST_BY_USER = 'FILTER_TWEETLIST_BY_USER';
const LIST_TWEETS_IN_CL = 'LIST_TWEETS_IN_CL';
const UPDATE_TWEETS_AFTER_RUNNING_ML = 'UPDATE_TWEETS_AFTER_RUNNING_ML';
const CAL_PD_FOR_TWEETS = 'CAL_PD_FOR_TWEETS';
const RUN_CLUSTERING_FOR_TWEETS = 'RUN_CLUSTERING_FOR_TWEETS';
const RUN_CL_N_CAL_PD_FOR_TWEETS = 'RUN_CL_N_CAL_PD_FOR_TWEETS';

// Action functions
export const fetchTweets = () => {
  return async dispatch => {
    await axios.get('/tweets/loadData').then(res => {
      const tweets = res.data.map(d => ({
        tweetId: d.tweet_id,
        group: d.grp,
        content: d.content,
        screenName: d.screen_name,
        valence: d.valence,
        valenceGrpPred: d.valence_grp_pred,
        valenceSeq: d.valence_seq,
        valenceSeqRank: d.valence_seq_rank,
        dominance: d.dominance,
        dominanceGrpPred: d.dominance_grp_pred,
        dominanceSeq: d.dominance_seq,
        dominanceSeqRank: d.dominance_seq_rank,
        care: d.care,
        careGrpPred: d.care_grp_pred,
        careSeq: d.care_seq,
        careSeqRank: d.care_seq_rank,
        fairness: d.fairness,
        fairnessGrpPred: d.fairness_grp_pred,
        fairnessSeq: d.fairness_seq,
        fairnessSeqRank: d.fairness_seq_rank
      }));

      const tweetsWithPredFeatures = res.data.map(d => ({
        tweetId: d.tweet_id,
        group: d.grp,
        content: d.content,
        screenName: d.screen_name,
        valence: d.valence_pred,
        valenceGrpPred: d.valence_grp_pred,
        valenceSeq: d.valence_seq,
        valenceSeqRank: d.valence_seq_rank,
        dominance: d.dominance_pred,
        dominanceSeq: d.dominance_seq,
        dominanceSeqRank: d.dominance_seq_rank,
        dominanceGrpPred: d.dominance_grp_pred,
        care: d.care_pred,
        careProb: d.care_prob,
        careGrpPred: d.care_grp_pred,
        careSeq: d.care_seq,
        careSeqRank: d.care_seq_rank,
        fairness: d.fairness_pred,
        fairnessProb: d.fairness_prob,
        fairnessGrpPred: d.fairness_grp_pred,
        fairnessSeq: d.fairness_seq,
        fairnessSeqRank: d.fairness_seq_rank
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

export function runDTThenRunClandPD({ tweets, selectedFeatures, modelId }) {
  // Again, Redux Thunk will inject dispatch here.
  // It also injects a second argument called getState() that lets us read the current state.
  return (dispatch, getState) => {
    // Remember I told you dispatch() can now handle thunks?
    return dispatch(
      runDT({ tweets: tweets, selectedFeatures: selectedFeatures })
    ).then(() => {
      // Assuming this is where the fetched user got stored
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
  tweetList: [],
  tweetListStatus: '',
  filteredTweetList: [],
  selectedTweet: [],
  secondSelectedTweet: [],
  isLoaded: false
};

// Reducers
const tweet = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TWEETS:
      return {
        ...state,
        tweets: action.payload.tweets,
        tweetList: action.payload.tweets,
        tweetsWithPredFeatures: action.payload.tweetsWithPredFeatures,
        selectedTweet: action.payload.tweets[0]
      };
    case UPDATE_TWEETS_ON_CHANGING_GLOBAL_MODE:
      const updatedGlobalMode = action.payload;
      switch (updatedGlobalMode) {
        case 0: // true-true
          return {
            ...state,
            tweets: state.tweets
          };
        case 1: // predicted-true
          return {
            ...state,
            tweets: state.tweets
          };
        case 2: // predicted-predicted
          return {
            ...state,
            tweets: state.tweetsWithPredFeatures
          };
        case 3: // predicted-predicted for DL
          return {
            ...state,
            tweets: state.tweetsWithPredFeatures
          };
      }
    case SELECT_TWEET:
      return {
        ...state,
        selectedTweet: action.payload
      };
    case SELECT_SECOND_TWEET:
      const selectedTweetId = action.payload;
      return {
        ...state,
        secondSelectedTweet: state.tweets.filter(
          d => d.tweetId === selectedTweetId
        )[0]
      };
    case SEARCH_TWEETS:
      return {
        ...state,
        tweetList: action.payload
      };
    case SORT_TWEETS_BY_FEATURE:
      const sortBy = action.payload,
        sortedTweetList = _.orderBy(state.tweetList, [sortBy]);
      return {
        ...state,
        tweetList: sortedTweetList
      };
    case FILTER_TWEETLIST_BY_USER:
      const selectedUser = action.payload;
      const filteredTweetList = state.tweetList.filter(
        d => d.screenName === selectedUser.screenName
      );
      return {
        ...state,
        filteredTweetList: filteredTweetList
      };
    case LIST_TWEETS_IN_CL:
      return {
        ...state,
        tweetList: action.payload
      };
    case UPDATE_TWEETS_AFTER_RUNNING_ML:
      return {
        ...state,
        tweets: JSON.parse(action.payload.tweets)
      };
    case CAL_PD_FOR_TWEETS:
      console.log('cal_pd_for_tweets');
    case RUN_CLUSTERING_FOR_TWEETS:
      return {
        ...state,
        tweets: JSON.parse(action.payload.tweets)
      };
    case RUN_CL_N_CAL_PD_FOR_TWEETS:
      const updatedTweets = state.tweets.map((d, i) => ({
        ...d,
        pdpValue: action.payload.pdpValues[i],
        clusterId: action.payload.clusterIdsForTweets[i]
      }));
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

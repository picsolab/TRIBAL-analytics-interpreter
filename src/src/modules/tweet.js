import _ from 'lodash';
import { runClusteringAndPartialDependenceForClusters } from './cluster';

import axios from 'axios';

// Action type
const FETCH_TWEETS = 'FETCH_TWEETS';
const SELECT_TWEET = 'SELECT_TWEET';
const SELECT_SECOND_TWEET = 'SELECT_SECOND_TWEET';
const SEARCH_TWEETS = 'SEARCH_TWEETS';
const SORT_TWEETS_BY_FEATURE = 'SORT_TWEETS_BY_FEATURE';
const FILTER_TWEETLIST_BY_USER = 'FILTER_TWEETLIST_BY_USER';
const LIST_TWEETS_IN_CL = 'LIST_TWEETS_IN_CL';
const RUN_DT = 'RUN_DT';
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
        valenceSeq: d.valence_seq,
        valenceSeqRank: d.valence_seq_rank,
        valencePred: d.valence_pred,
        valenceGrpPred: d.valence_grp_pred,
        dominance: d.dominance,
        dominanceSeq: d.dominance_seq,
        dominanceSeqRank: d.dominance_seq_rank,
        dominancePred: d.dominance_pred,
        dominanceGrpPred: d.dominance_grp_pred,
        harm: d.harm,
        harmSeq: d.harm_seq,
        harmSeqRank: d.harm_seq_rank,
        harmPred: d.harm_pred,
        harmGrpPred: d.harm_grp_pred,
        harmProb: d.harm_prob,
        fairness: d.fairness,
        fairnessSeq: d.fairness_seq,
        fairnessSeqRank: d.fairness_seq_rank,
        fairnessPred: d.fairness_pred,
        fairnessGrpPred: d.fairness_grp_pred,
        fairnessProb: d.fairness_prob
      }));

      const tweetsWithPredFeatures = res.data.map(d => ({
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
    case SELECT_TWEET:
      return {
        ...state,
        selectedTweet: action.payload
      };
    case SELECT_SECOND_TWEET:
      return {
        ...state,
        secondSelectedTweet: action.payload
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
    case RUN_DT:
      return {
        ...state,
        currentModel: action.payload.modelId,
        modelId: action.payload.modelId,
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

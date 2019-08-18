import _ from 'lodash';
import axios from 'axios';

// Action type
const FETCH_CLUSTERS = 'FETCH_CLUSTERS';
const RUN_CLUSTERING = 'RUN_CLUSTERING';
const RUN_CL_N_CAL_PD = 'RUN_CL_N_CAL_PD';

export const runClusteringAndPartialDependenceForClusters = ({
  tweets,
  features,
  modelId
}) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/runClusteringAndPartialDependenceForClusters/',
      data: JSON.stringify({
        tweets: tweets,
        modelId: modelId,
        features: features
      })
    }).then(res => {
      dispatch({ type: 'RUN_CL_N_CAL_PD', payload: res.data });
      dispatch({ type: 'RUN_CL_N_CAL_PD_FOR_PDP_VALUES', payload: res.data });
      dispatch({ type: 'RUN_CL_N_CAL_PD_FOR_TWEETS', payload: res.data });
    });
  };
};

export const runClustering = () => {
  return (dispatch, getState) => {
    var saveState;
    axios({
      method: 'get',
      url: '/tweets/runClustering/'
    }).then(res => {
      const res_tweets = JSON.parse(res.data.tweets);
      dispatch({ type: 'RUN_CLUSTERING', payload: res.data });
      dispatch({ type: 'RUN_CLUSTERING_FOR_TWEETS', payload: res.data });
    });

    return saveState;
  };
};

// initial value for state
const initialState = {
  clusters: [],
  clusterIdsForTweets: []
};

// Reducers
const cluster = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CLUSTERS:
      return {
        ...state,
        clusters: action.payload
      };
    case RUN_CLUSTERING:
      return {
        ...state,
        clusters: JSON.parse(action.payload.clusters).map(d => ({
          ...d,
          groupRatio: { lib: d.groupRatio, con: 1 - d.groupRatio }
        }))
      };
    case RUN_CL_N_CAL_PD:
      const orderedCluster = _.orderBy(
        JSON.parse(action.payload.clusters),
        ['groupRatio'],
        ['desc']
      );
      return {
        ...state,
        clusters: orderedCluster.map(d => ({
          ...d,
          groupRatio: { lib: d.groupRatio, con: 1 - d.groupRatio }
        })),
        clusterIdsForTweets: action.payload.clusterIdsForTweets
      };
    default:
      return state;
  }
};

export default cluster;

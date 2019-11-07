import _ from 'lodash';
import axios from 'axios';
import {stat} from 'fs';

// Action type
const FETCH_CLUSTERS = 'FETCH_CLUSTERS';
const RUN_CLUSTERING = 'RUN_CLUSTERING';
const RUN_CLUSTERING_FOR_GOALS = 'RUN_CLUSTERING_FOR_GOALS';
const RUN_CL_N_CAL_PD = 'RUN_CL_N_CAL_PD';

export const runClusteringAndPartialDependenceForClusters = ({tweets, features, modelId, groups}) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/runClusteringAndPartialDependenceForClusters/',
      data: JSON.stringify({
        tweets: tweets,
        modelId: modelId,
        features: features,
        groups: groups
      })
    }).then(res => {
      console.log('runClusteringAndPartialDependenceForClusters: ', res.data);
      dispatch({type: 'RUN_CL_N_CAL_PD', payload: res.data});
      dispatch({type: 'RUN_CL_N_CAL_PD_FOR_PDP_VALUES', payload: res.data});
      dispatch({type: 'RUN_CL_N_CAL_PD_FOR_TWEETS', payload: res.data});
      dispatch({type: 'RUN_CLUSTERING_FOR_GOALS', payload: res.data});
    });
  };
};

export const runClusteringForGoals = () => {
  return (dispatch, getState) => {
    var saveState;
    axios({
      method: 'get',
      url: '/tweets/runClusteringForGoals/'
    }).then(res => {
      console.log('res data for runClusteringForGoals: ', res.data);
      dispatch({type: 'RUN_CLUSTERING_FOR_GOALS', payload: res.data});
    });

    return saveState;
  };
};

// initial value for state
const initialState = {
  clusters: [],
  clusterIdsForTweets: [],
  clustersForGoals: []
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
          groupRatio: {lib: d.groupRatio, con: 1 - d.groupRatio}
        }))
      };
    case RUN_CLUSTERING_FOR_GOALS:
      console.log('RUN_CLUSTERING_FOR_GOALS: ', action.payload.clustersForGoals);
      return {
        ...state,
        clustersForGoals: action.payload.clustersForGoals
      };
    case RUN_CL_N_CAL_PD:
      let orderedCluster = _.orderBy(action.payload.clusters, ['groupRatio'], ['desc']);

      console.log('orderedCluster0: ', orderedCluster);
      let temp = orderedCluster[9];
      console.log('orderedCluster1: ', orderedCluster);
      orderedCluster[9] = orderedCluster[7];
      console.log('orderedCluster2: ', orderedCluster);
      orderedCluster[7] = temp;
      console.log('orderedCluster3: ', orderedCluster);
      return {
        ...state,
        clusters: orderedCluster.map(d => ({
          ...d,
          groupRatio: {lib: d.groupRatio, con: 1 - d.groupRatio}
        })),
        clusterIdsForTweets: action.payload.clusterIdsForTweets
      };
    default:
      return state;
  }
};

export default cluster;

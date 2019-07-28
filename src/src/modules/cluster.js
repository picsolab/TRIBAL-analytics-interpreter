import axios from 'axios';

// Action type
const FETCH_CLUSTERS = 'FETCH_CLUSTERS';
const RUN_CLUSTERING = 'RUN_CLUSTERING';

export const runClustering = () => {
  return async dispatch => {
    await axios({
      method: 'get',
      url: '/tweets/runClustering/'
    }).then(res => {
      const res_data = JSON.parse(res.data);
      const clusters = res_data.map(d => ({
        ...d,
        groupRatio: { lib: d.groupRatio, con: 1 - d.groupRatio }
      }));
      dispatch({ type: 'RUN_CLUSTERING', payload: clusters });
    });
  };
};

// initial value for state
const initialState = {
  clusters: []
};

// Reducers
const cluster = (state = initialState, action) => {
  console.log('state: ', state);
  console.log('action: ', action);
  switch (action.type) {
    case FETCH_CLUSTERS:
      console.log('in the case of FETCH_CLUSTERS');
      return {
        ...state,
        clusters: action.payload
      };
    case RUN_CLUSTERING:
      console.log('in the case of RUN_CLUSTERING');
      console.log(action.payload);
      return {
        ...state,
        clusters: action.payload
      };
    default:
      console.log('in the case of default in cluster: ', state);
      return state;
  }
};

export default cluster;

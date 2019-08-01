import { combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import counter from './counter';
import browser from './browser';
import dataLoader from './dataLoader';
import cluster from './cluster';
import globalInterpreter from './globalInterpreter';
import localInterpreter from './localInterpreter';

const logger = createLogger();

// instead of using combineReducers(),
// const rootReducer = combineReducers({
//   dataLoader,
//   counter,
//   browser,
//   scaler: scaler(state.scaler, )
//   // applyMiddleWare([ReduxThunk, logger])
// });

const rootReducer = (state = {}, action) => {
  const actionFetchData = dataLoader.fetch;
  return {
    dataLoader: dataLoader(state.dataLoader, action),
    cluster: cluster(state.cluster, action),
    browser: browser(state.browser, { ...action, actionFetchData }),
    globalInterpreter: globalInterpreter(state.globalInterpreter, action),
    localInterpreter: localInterpreter(state.localInterpreter, action)
  };
};

export default rootReducer;

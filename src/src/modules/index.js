import { combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import counter from './counter';
import browser from './browser';
import dataLoader from './dataLoader';

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
  const ddd = 'dd';
  const actionFetchData = dataLoader.fetch;
  return {
    dataLoader: dataLoader(state.dataLoader, action),
    browser: browser(state.browser, { ...action, actionFetchData })
  };
};

export default rootReducer;

import { combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import counter from './counter';
import browser from './browser';

const logger = createLogger();

const rootReducer = combineReducers({
  counter,
  browser
  // applyMiddleWare([ReduxThunk, logger])
});

export default rootReducer;

import { combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import counter from './counter';
import browser from './browser';
import instanceViewer from './instanceViewer';

const logger = createLogger();

const rootReducer = combineReducers({
  counter,
  browser,
  instanceViewer
  // applyMiddleWare([ReduxThunk, logger])
});

export default rootReducer;

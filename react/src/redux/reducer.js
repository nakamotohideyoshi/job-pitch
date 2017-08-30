import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';
import auth from './modules/auth';
import jobmanager from './modules/jobmanager';
import common from './modules/common';

export default function createReducers(asyncReducers) {
  return {
    routing: routerReducer,
    reduxAsyncConnect,
    online: (v = true) => v,
    common,
    auth,
    jobmanager,
    ...asyncReducers
  };
}

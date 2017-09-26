import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';
import common from './modules/common';
import auth from './modules/auth';
import api from './modules/api';
import jobmanager from './modules/jobmanager';

export default function createReducers(asyncReducers) {
  return {
    routing: routerReducer,
    reduxAsyncConnect,
    online: (v = true) => v,
    common,
    auth,
    api,
    jobmanager,
    ...asyncReducers
  };
}

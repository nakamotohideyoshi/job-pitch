import { takeEvery, put, call } from 'redux-saga/effects';
import * as api from 'utils/api';
import * as C from './constants';

// get jobs

function* _getApplications() {
  try {
    let applications = yield call(api.get, '/api/applications/');

    yield put({ type: C.JS_GET_APPLICATIONS_SUCCESS, applications });
  } catch (errors) {
    yield put({ type: C.JS_GET_APPLICATIONS_ERROR, errors });
  }
}

function* getApplications() {
  yield takeEvery(C.JS_GET_APPLICATIONS, _getApplications);
}

export default [getApplications()];

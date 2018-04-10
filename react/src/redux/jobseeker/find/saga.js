import { LOCATION_CHANGE } from 'react-router-redux';
import { takeLatest, race, call, take } from 'redux-saga/effects';

import * as C from 'redux/constants';
import { getRequest, postRequest } from 'utils/request1';

function* findJobs(action) {
  yield race({
    result: call(getRequest({ url: '/api/jobs/' }), action),
    cancel: take(LOCATION_CHANGE)
  });
}

const applyJob = postRequest({
  url: `/api/applications/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => payload
});

export default function* sagas() {
  yield takeLatest(C.JS_FIND_JOBS, findJobs);
  yield takeLatest(C.JS_APPLY_JOB, applyJob);
}

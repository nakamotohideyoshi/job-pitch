import { takeLatest } from 'redux-saga/effects';
import * as C from 'redux/constants';
import { weakRequest, getRequest, postRequest } from 'utils/request';

const findJobs = weakRequest(
  getRequest({
    url: '/api/jobs/'
  })
);

const applyJob = weakRequest(
  postRequest({
    url: `/api/applications/`
  })
);

export default function* sagas() {
  yield takeLatest(C.JS_FIND_JOBS, findJobs);
  yield takeLatest(C.JS_APPLY_JOB, applyJob);
}

import { takeLatest } from 'redux-saga/effects';

import * as C from 'redux/constants';
import { getRequest, postRequest } from 'utils/request';

const getJobs = getRequest({ type: C.JS_GET_JOBS, url: `/api/jobs/` });
const applyJob = postRequest({ type: C.JS_APPLY_JOB, url: `/api/applications/` });

export default function* sagas() {
  yield takeLatest(C.JS_GET_JOBS, getJobs);
  yield takeLatest(C.JS_APPLY_JOB, applyJob);
}

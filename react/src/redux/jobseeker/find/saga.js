import { takeLatest } from 'redux-saga/effects';
import * as C from 'redux/constants';
import { weakRequest, getRequest, postRequest } from 'utils/request';

const findJobs = weakRequest(
  getRequest({
    url: '/api/jobs/'
  })
);

const findPublicJob = weakRequest(
  getRequest({
    url: ({ jobId }) => `/api/public/jobs/${jobId}/`
  })
);

const findPublicJobList = weakRequest(
  getRequest({
    url: ({ locationId }) => `/api/public/locations/${locationId}/`
  })
);

const applyJob = weakRequest(
  postRequest({
    url: `/api/applications/`
  })
);

export default function* sagas() {
  yield takeLatest(C.JS_FIND_JOBS, findJobs);
  yield takeLatest(C.JS_FIND_PUBLIC_JOB, findPublicJob);
  yield takeLatest(C.JS_FIND_PUBLIC_JOB_LIST, findPublicJobList);
  yield takeLatest(C.JS_APPLY_JOB, applyJob);
}

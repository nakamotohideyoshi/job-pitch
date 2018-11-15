import { takeLatest } from 'redux-saga/effects';

import { request, getRequest, deleteRequest } from 'utils/request';
import * as C from 'redux/constants';

const getJobs = getRequest({
  type: C.HR_GET_JOBS,
  url: '/api/hr/jobs/'
});

const saveJob = request({
  method: ({ data }) => (data.id ? 'put' : 'post'),
  url: ({ data }) => (data.id ? `/api/hr/jobs/${data.id}/` : '/api/hr/jobs/')
});

const removeJob = deleteRequest({
  url: ({ id }) => `/api/hr/jobs/${id}/`
});

export default function* sagas() {
  yield takeLatest(C.HR_GET_JOBS, getJobs);
  yield takeLatest(C.HR_SAVE_JOB, saveJob);
  yield takeLatest(C.HR_REMOVE_JOB, removeJob);
}

import { takeLatest } from 'redux-saga/effects';
import * as C from 'redux/constants';
import { getRequest, postRequest, putRequest, deleteRequest } from 'utils/request';

const getAllJobs = getRequest({
  url: '/api/user-jobs/'
});

const getJobseekers = getRequest({
  url: ({ payload }) => `/api/job-seekers/?job=${payload.jobId}`
});

const connectJobseeker = postRequest({
  url: `/api/applications/`
});

const getApplications = getRequest({
  url: ({ payload }) => {
    const { jobId, status, shortlist } = payload;
    const params = [];
    if (jobId) {
      params.push(`job=${jobId}`);
    }
    if (status) {
      params.push(`status=${status}`);
    }
    if (shortlist) {
      params.push(`shortlisted=${shortlist}`);
    }
    const query = params.length ? `?${params.join('&')}` : '';
    return `/api/applications/${query}`;
  }
});

const updateApplication = putRequest({
  url: ({ payload }) => `/api/applications/${payload.id}/`
});

const removeApplication = deleteRequest({
  url: ({ payload }) => `/api/applications/${payload.id}/`,
  payloadOnSuccess: (_, { payload }) => payload
});

export default function* sagas() {
  yield takeLatest(C.RC_GET_ALL_JOBS, getAllJobs);

  yield takeLatest(C.RC_GET_JOBSEEKERS, getJobseekers);
  yield takeLatest(C.RC_CONNECT_JOBSEEKER, connectJobseeker);

  yield takeLatest(C.RC_GET_APPS, getApplications);
  yield takeLatest(C.RC_UPDATE_APP, updateApplication);
  yield takeLatest(C.RC_REMOVE_APP, removeApplication);
}

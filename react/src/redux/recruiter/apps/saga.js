import { takeLatest, call, select, put } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import DATA from 'utils/data';
import { getRequest, postRequest, putRequest, deleteRequest, requestSuccess } from 'utils/request';

function* useToken() {
  const { rc_apps: { jobs, selectedJobId } } = yield select();
  const job = helper.getItemByID(jobs, selectedJobId);
  const business = job.location_data.business_data;
  const updatedBusiness = {
    ...business,
    tokens: business.tokens - 1
  };
  job.location_data.business_data = updatedBusiness;
  yield put({ type: requestSuccess(C.RC_SELECT_BUSINESS), payload: updatedBusiness });
}

const getOpenedJobs = getRequest({
  url: '/api/user-jobs/',
  payloadOnSuccess: data => data.filter(({ status }) => status === DATA.JOB.OPEN)
});

const getJobseekers = getRequest({
  url: ({ jobId }) => `/api/job-seekers/?job=${jobId}`
});

function* connectJobseeker(action) {
  const result = yield call(
    postRequest({
      url: `/api/applications/`,
      payloadOnSuccess: payload => payload
    }),
    action
  );

  result && (yield call(useToken));
}

const getApplications = getRequest({
  url: ({ jobId, status, shortlist }) => {
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

function* connectApplication(action) {
  const { id } = action.payload;
  const result = yield call(
    putRequest({
      type: C.RC_REMOVE_APP,
      url: `/api/applications/${id}/`,
      payloadOnSuccess: payload => payload
    }),
    action
  );

  result && (yield call(useToken));
}

const updateApplication = putRequest({
  url: ({ data }) => `/api/applications/${data.id}/`
});

const removeApplication = deleteRequest({
  url: ({ id }) => `/api/applications/${id}/`,
  payloadOnSuccess: payload => payload
});

export default function* sagas() {
  yield takeLatest(C.RC_GET_OPENED_JOBS, getOpenedJobs);

  yield takeLatest(C.RC_GET_JOBSEEKERS, getJobseekers);
  yield takeLatest(C.RC_CONNECT_JOBSEEKER, connectJobseeker);

  // yield takeLatest(C.GET_APPLICATIONS, getApplications);
  yield takeLatest(C.RC_GET_APPS, getApplications);
  yield takeLatest(C.RC_CONNECT_APP, connectApplication);
  yield takeLatest(C.RC_UPDATE_APP, updateApplication);
  yield takeLatest(C.RC_REMOVE_APP, removeApplication);
}

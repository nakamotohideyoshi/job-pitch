import { delay } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

// get jobseekers

function* _getJobseeker({ jobId, jobseekerId }) {
  try {
    const jobseekers = yield call(api.get, `/api/job-seekers/?job=${jobId}`);
    const jobseeker = jobseekers.filter(js => js.id === jobseekerId)[0];
    let application;
    if (!jobseeker) {
      const applications = yield call(api.get, `/api/applications/?job=${jobId}`);
      application = applications.filter(app => app.job_seeker.id)[0];
    }
    yield put({ type: C.RC_GET_JOBSEEKER_SUCCESS, jobseeker, application });
  } catch (errors) {
    yield put({ type: C.RC_GET_JOBSEEKER_ERROR, errors });
  }
}

function* getJobseeker() {
  yield takeEvery(C.RC_GET_JOBSEEKER, _getJobseeker);
}

export default [getJobseeker()];

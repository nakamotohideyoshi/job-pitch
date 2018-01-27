import { takeEvery, put, call, select } from 'redux-saga/effects';
import { SDATA } from 'utils/data';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

// get jobs

function* _getJobs() {
  try {
    const jobseeker = yield call(api.get, `/api/job-seekers/${SDATA.user.job_seeker}/`);
    const profile = yield call(api.get, `/api/job-profiles/${jobseeker.profile}/`);
    let jobs = yield call(api.get, '/api/jobs/');

    yield put({ type: C.JS_GET_JOBS_SUCCESS, jobseeker, profile, jobs });
  } catch (errors) {
    yield put({ type: C.JS_GET_JOBS_ERROR, errors });
  }
}

function* getJobs() {
  yield takeEvery(C.JS_GET_JOBS, _getJobs);
}

// apply job

function* _applyJob({ jobId }) {
  try {
    yield call(api.post, '/api/applications/', {
      job: jobId,
      job_seeker: SDATA.user.job_seeker
    });

    yield put({ type: C.JS_APPLY_JOB_SUCCESS, jobId });
  } catch (errors) {
    yield put({ type: C.JS_APPLY_JOB_ERROR, jobId });
    helper.errorNotif('Server Error!');
  }
}

function* applyJob() {
  yield takeEvery(C.JS_APPLY_JOB, _applyJob);
}

export default [getJobs(), applyJob()];

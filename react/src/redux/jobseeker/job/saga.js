import { takeEvery, put, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

// get jobs

function* _getJob({ jobId }) {
  try {
    let jobs = yield call(api.get, '/api/jobs/');
    const job = jobs.filter(job => job.id === jobId)[0];
    if (job) {
      yield call(helper.saveData, 'jobs_selectedid', jobId);
      yield put(push(`/jobseeker/find`));
      return;
    }

    const applications = yield call(api.get, `/api/applications/`);
    const application = applications.filter(app => app.job_data.id === jobId)[0];
    if (application) {
      yield call(helper.saveData, 'jobs_selectedid', application.id);
      yield put(push(`/jobseeker/applications`));
      return;
    }
  } catch (errors) {}
  yield put(push(`/jobseeker/find`));
}

function* getJob() {
  yield takeEvery(C.JS_GET_JOB, _getJob);
}

export default [getJob()];

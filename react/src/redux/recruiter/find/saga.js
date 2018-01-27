import { delay } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

/**
|--------------------------------------------------
| jobseekers
|--------------------------------------------------
*/

// get jobseekers

function* _getJobseekers({ jobId }) {
  try {
    const jobseekers = yield call(api.get, `/api/job-seekers/?job=${jobId}`);
    yield put({ type: C.RC_GET_JOBSEEKERS_SUCCESS, jobseekers });
  } catch (errors) {
    yield put({ type: C.RC_GET_JOBSEEKERS_ERROR, errors });
  }
}

function* getJobseekers() {
  yield takeEvery(C.RC_GET_JOBSEEKERS, _getJobseekers);
}

// connect jobseeker

function* _connectJobseeker({ jobseekerId, jobId }) {
  try {
    yield call(api.post, '/api/applications/', {
      job: jobId,
      job_seeker: jobseekerId
    });

    yield put({ type: C.RC_CONNECT_JOBSEEKER_SUCCESS, jobseekerId });
  } catch (errors) {
    yield put({ type: C.RC_CONNECT_JOBSEEKER_ERROR, jobseekerId });
    helper.errorNotif('Server Error!');
  }
}

function* connectJobseeker() {
  yield takeEvery(C.RC_CONNECT_JOBSEEKER, _connectJobseeker);
}

export default [getJobseekers(), connectJobseeker()];

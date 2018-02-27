import { delay } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

// get jobseekers

function* _getJobseeker({ jobId, jobseekerId }) {
  try {
    const jobseekers = yield call(api.get, `/api/job-seekers/?job=${jobId}`);
    const jobseeker = jobseekers.filter(js => js.id === jobseekerId)[0];
    if (jobseeker) {
      yield call(helper.saveData, 'apps_selectedid', jobseekerId);
      yield put(push(`/recruiter/applications/find/${jobId}`));
      return;
    }

    const applications = yield call(api.get, `/api/applications/?job=${jobId}`);
    const application = applications.filter(app => app.job_seeker.id === jobseekerId)[0];
    if (application) {
      yield call(helper.saveData, 'apps_selectedid', application.id);
      const status = helper.getNameByID('appStatuses', applications.status);
      if (status === 'CREATED') {
        yield put(push(`/recruiter/applications/apps/${jobId}`));
      } else {
        yield put(push(`/recruiter/applications/conns/${jobId}`));
      }
      return;
    }
  } catch (errors) {}
}

function* getJobseeker() {
  yield takeEvery(C.RC_GET_JOBSEEKER, _getJobseeker);
}

export default [getJobseeker()];

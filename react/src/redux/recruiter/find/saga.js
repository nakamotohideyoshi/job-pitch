import { takeLatest, call, put } from 'redux-saga/effects';

import { updateBusiness } from 'redux/recruiter/businesses/saga';
import { weakRequest, getRequest, postRequest, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';

const findJobseekers = weakRequest(getRequest({ url: '/api/job-seekers/' }));

function* connectJobseeker({ payload }) {
  const { onSuccess, onFail, data: { job_seeker } } = payload;

  const result = yield call(postRequest({ url: `/api/applications/` }), { payload });
  if (result !== null) {
    const application = yield call(getRequest({ url: `/api/applications/${result.id}/` }));
    yield put({ type: requestSuccess(C.RC_CONNECT_JOBSEEKER), job_seeker });
    if (application !== null) {
      yield call(updateBusiness, application.job_data.location_data.business_data);
      yield put({ type: requestSuccess(C.UPDATE_APPLICATION), application });
      onSuccess && onSuccess();
    } else {
      onFail && onFail();
    }
    return;
  }

  yield put({ type: requestFail(C.RC_CONNECT_JOBSEEKER), job_seeker });
  onFail && onFail();
}

export default function* sagas() {
  yield takeLatest(C.RC_FIND_JOBSEEKERS, findJobseekers);
  yield takeLatest(C.RC_CONNECT_JOBSEEKER, connectJobseeker);
}

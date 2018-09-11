import { takeLatest, call, put } from 'redux-saga/effects';

import { weakRequest, getRequest, postRequest, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';

const findJobs = weakRequest(getRequest({ url: '/api/jobs/' }));

function* applyJob({ payload }) {
  const { onSuccess, onFail, data } = payload;

  const result = yield call(postRequest({ url: `/api/applications/` }), { payload });
  if (result !== null) {
    const application = yield call(getRequest({ url: `/api/applications/${result.id}/` }));
    yield put({ type: requestSuccess(C.JS_APPLY_JOB), job: data.job });
    if (application !== null) {
      yield put({ type: requestSuccess(C.UPDATE_APPLICATION), application });
      onSuccess && onSuccess();
    } else {
      onFail && onFail();
    }
    return;
  }

  yield put({ type: requestFail(C.JS_APPLY_JOB), job: data.job });
  onFail && onFail();
}

const getPublicJob = weakRequest(
  getRequest({
    url: id => `/api/public/jobs/${id}/`
  })
);

const getPublicWorkplace = weakRequest(
  getRequest({
    url: id => `/api/public/locations/${id}/`
  })
);

export default function* sagas() {
  yield takeLatest(C.JS_FIND_JOBS, findJobs);
  yield takeLatest(C.JS_APPLY_JOB, applyJob);
  yield takeLatest(C.JS_GET_PUBLIC_JOB, getPublicJob);
  yield takeLatest(C.JS_GET_PUBLIC_WORKPLACE, getPublicWorkplace);
}

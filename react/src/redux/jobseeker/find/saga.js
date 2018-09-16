import { delay } from 'redux-saga';
import { takeLatest, call, put } from 'redux-saga/effects';

import * as C from 'redux/constants';
import { weakRequest, getRequest, postRequest, requestSuccess, requestFail } from 'utils/request';
import { uploadVideo } from 'utils/aws';

const findJobs = weakRequest(getRequest({ url: '/api/jobs/' }));

function* applyJob({ payload }) {
  const { onSuccess, onFail, data } = payload;

  const result = yield call(postRequest({ url: `/api/applications/` }), { payload });
  if (result !== null) {
    const application = yield call(getRequest({ url: `/api/applications/${result.id}/` }));
    yield put({ type: requestSuccess(C.JS_APPLY_JOB), job: data.job });
    if (application !== null) {
      yield put({ type: requestSuccess(C.UPDATE_APPLICATION), application });
      onSuccess && onSuccess(application);
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

function* uploadSpecPitch(action) {
  const { job_seeker, application, data, onProgress, onSuccess, onFail } = action.payload;

  onProgress('Starting pitch upload...');
  let newPitch = yield call(postRequest({ url: `/api/application-pitches/` }), {
    payload: { data: { job_seeker, application } }
  });

  if (!newPitch) {
    onFail && onFail();
    return;
  }

  try {
    yield call(uploadVideo, 'application-pitches', newPitch, data, onProgress);
  } catch (error) {
    onFail && onFail('Uploading is failed.');
    return;
  }

  onProgress('Processing...');

  const pitchId = newPitch.id;
  do {
    yield delay(2000);
    newPitch = yield call(getRequest({ url: `/api/application-pitches/${pitchId}/` }));
  } while (!newPitch.video);

  onSuccess && onSuccess();
}

export default function* sagas() {
  yield takeLatest(C.JS_FIND_JOBS, findJobs);
  yield takeLatest(C.JS_APPLY_JOB, applyJob);
  yield takeLatest(C.JS_GET_PUBLIC_JOB, getPublicJob);
  yield takeLatest(C.JS_GET_PUBLIC_WORKPLACE, getPublicWorkplace);
  yield takeLatest(C.JS_UPLOAD_SPEC_PITCH, uploadSpecPitch);
}

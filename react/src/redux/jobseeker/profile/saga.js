import { delay } from 'redux-saga';
import { takeLatest, call, put, select } from 'redux-saga/effects';

import { request, getRequest, postRequest } from 'utils/request';
import { uploadVideoToAWS } from 'utils/aws';
import * as C from 'redux/constants';

function* saveJobseeker(action) {
  const jobseeker = yield call(
    request({
      method: ({ id }) => (id ? 'patch' : 'post'),
      url: ({ id }) => (id ? `/api/job-seekers/${id}/` : '/api/job-seekers/')
    }),
    action
  );
  yield put({ type: C.UPDATE_AUTH, payload: { jobseeker } });
}

function* saveJobProfile(action) {
  const jobprofile = yield call(
    request({
      method: ({ id }) => (id ? 'put' : 'post'),
      url: ({ id }) => (id ? `/api/job-profiles/${id}/` : '/api/job-profiles/')
    }),
    action
  );
  yield put({ type: C.UPDATE_AUTH, payload: { jobprofile } });
}

function* uploadPitch(action) {
  const { data, onProgress, onSuccess, onFail } = action.payload;

  onProgress('Starting pitch upload...');
  let newPitch = yield call(postRequest({ url: `/api/pitches/` }));

  if (!newPitch) {
    onFail && onFail();
    return;
  }

  try {
    yield call(uploadVideoToAWS, 'pitches', newPitch, data, onProgress);
  } catch (error) {
    onFail && onFail();
    return;
  }

  onProgress('Processing...');

  const pitchId = newPitch.id;
  do {
    yield delay(2000);
    newPitch = yield call(getRequest({ url: `/api/pitches/${pitchId}/` }));
  } while (!newPitch.video);

  const { auth } = yield select();
  const jobseeker = yield call(getRequest({ url: `/api/job-seekers/${auth.jobseeker.id}/` }));
  yield put({ type: C.UPDATE_AUTH, payload: { jobseeker } });

  onSuccess && onSuccess();
}

export default function* sagas() {
  yield takeLatest(C.JS_SAVE_PROFILE, saveJobseeker);
  yield takeLatest(C.JS_SAVE_JOBPROFILE, saveJobProfile);
  yield takeLatest(C.JS_UPLOAD_PITCH, uploadPitch);
}

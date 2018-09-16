import { delay } from 'redux-saga';
import { takeLatest, call, put, select } from 'redux-saga/effects';

import request, { getRequest, postRequest, putRequest, requestSuccess } from 'utils/request';
import { uploadVideo } from 'utils/aws';
import * as C from 'redux/constants';

function* saveJobseeker(action) {
  const { id } = action.payload.data;
  yield call(
    request({
      method: id ? 'patch' : 'post',
      url: id ? `/api/job-seekers/${id}/` : '/api/job-seekers/'
    }),
    action
  );
}

function* saveJobProfile(action) {
  const { id } = action.payload.data;
  if (!id) {
    yield call(postRequest({ url: '/api/job-profiles/' }), action);
  } else {
    yield call(putRequest({ url: `/api/job-profiles/${id}/` }), action);
  }
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
    yield call(uploadVideo, 'pitches', newPitch, data, onProgress);
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

  const { js_profile } = yield select();
  const jobseeker = yield call(getRequest({ url: `/api/job-seekers/${js_profile.jobseeker.id}/` }));
  yield put({ type: requestSuccess(C.JS_SAVE_PROFILE), payload: jobseeker });

  onSuccess && onSuccess();
}

export default function* sagas() {
  yield takeLatest(C.JS_SAVE_PROFILE, saveJobseeker);
  yield takeLatest(C.JS_SAVE_JOBPROFILE, saveJobProfile);
  yield takeLatest(C.JS_UPLOAD_PITCH, uploadPitch);
}

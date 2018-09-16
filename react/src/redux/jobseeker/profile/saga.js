import { delay } from 'redux-saga';
import { takeLatest, call, put, select } from 'redux-saga/effects';

import request, { getRequest, postRequest, putRequest, requestSuccess } from 'utils/request';
import { uploadVideo } from 'utils/aws';
import * as C from 'redux/constants';

function* saveJobseeker({ payload }) {
  const { data, avatar, onProgress, onSuccess, onFail } = payload;

  const jobseeker = yield call(
    request({
      method: data.id ? 'put' : 'post',
      url: data.id ? `/api/job-seekers/${data.id}/` : '/api/job-seekers/'
    }),
    { payload }
  );

  if (jobseeker === null) {
    onFail && onFail('There was an error saving the profile');
    return;
  }

  // if (avatar) {
  //   if (avatar.file) {
  //     const image = yield call(postRequest({ url: '/api/user-business-images/' }), {
  //       payload: {
  //         isFormData: true,
  //         data: {
  //           order: 0,
  //           job_seeker: jobseeker.id,
  //           image: avatar.file
  //         },
  //         onUploadProgress: onProgress
  //       }
  //     });

  //     if (image === null) {
  //       onFail && onFail('There was an error uploading the logo');
  //     } else {
  //       // business.images = [image];
  //     }
  //   } else if (business.images.length && !logo.exist) {
  //     yield call(deleteRequest({ url: `/api/user-business-images/${business.images[0].id}/` }));
  //     business.images = [];
  //   }
  // }

  yield put({ type: requestSuccess(C.JS_SAVE_PROFILE), payload: jobseeker });

  onSuccess && onSuccess();
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

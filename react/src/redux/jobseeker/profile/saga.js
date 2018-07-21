import { delay } from 'redux-saga';
import { takeLatest, call, put, select } from 'redux-saga/effects';

import { getRequest, postRequest, putRequest, requestSuccess } from 'utils/request';
import * as C from 'redux/constants';

import AWS from 'aws-sdk';

function* saveJobseeker(action) {
  const { id } = action.payload.data;
  if (!id) {
    yield call(postRequest({ url: '/api/job-seekers/' }), action);
  } else {
    yield call(putRequest({ url: `/api/job-seekers/${id}/` }), action);
  }
}

function* saveJobProfile(action) {
  const { id } = action.payload.data;
  if (!id) {
    yield call(postRequest({ url: '/api/job-profiles/' }), action);
  } else {
    yield call(putRequest({ url: `/api/job-profiles/${id}/` }), action);
  }
}

export const _uploadPitch = ({ id, token }, pitchData, onUploadProgress) =>
  new Promise(resolve => {
    const folder = window.location.origin.replace('//', '');
    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      credentials: new AWS.CognitoIdentityCredentials(
        {
          IdentityPoolId: 'eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2'
        },
        {
          region: 'eu-west-1'
        }
      )
    });
    s3
      .upload(
        {
          Bucket: 'mjp-android-uploads',
          Key: `${folder}/${token}.${id}.pitches.${new Date().getTime()}`,
          Body: pitchData,
          ContentType: 'video/webm'
        },
        (error, data) => {
          if (error) {
            throw error;
          }
          resolve();
        }
      )
      .on('httpUploadProgress', progress => {
        onUploadProgress('Uploading...', Math.floor(progress.loaded / progress.total * 100));
      });
  });

function* uploadPitch(action) {
  const { data, onProgress, onSuccess, onFail } = action.payload;

  onProgress('Starting pitch upload...');
  let newPitch = yield call(postRequest({ url: `/api/pitches/` }));

  if (!newPitch) {
    onFail && onFail();
    return;
  }

  try {
    yield call(_uploadPitch, newPitch, data, onProgress);
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

  onSuccess && onSuccess(newPitch.video);
}

export default function* sagas() {
  yield takeLatest(C.JS_SAVE_PROFILE, saveJobseeker);
  yield takeLatest(C.JS_SAVE_JOBPROFILE, saveJobProfile);
  yield takeLatest(C.JS_UPLOAD_PITCH, uploadPitch);
}

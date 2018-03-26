import { delay } from 'redux-saga';
import { takeLatest, put, call, select } from 'redux-saga/effects';
import AWS from 'aws-sdk';

import * as C from 'redux/constants';
import { getRequest, postRequest } from 'utils/request';

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
          Key: `${folder}/${token}.${id}.${new Date().getTime()}`,
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

function* uploadPitch({ payload: { data, onUploadProgress, success, fail } }) {
  onUploadProgress('Starting upload...');
  let newPitch = yield call(postRequest({ url: `/api/pitches/` }), {});
  if (!newPitch) {
    fail && fail(`Upload failed`);
    return;
  }

  try {
    yield call(_uploadPitch, newPitch, data, onUploadProgress);
  } catch (error) {
    fail && fail(`Upload failed`);
    return;
  }

  onUploadProgress('Processing...');
  const pitchId = newPitch.id;
  do {
    yield delay(2000);
    newPitch = yield call(getRequest({ url: `/api/pitches/${pitchId}/` }));
  } while (!newPitch.video);

  const { auth } = yield select();
  const jobseeker = yield call(getRequest({ url: `/api/job-seekers/${auth.jobseeker.id}/` }));
  yield put({ type: C.UPDATE_AUTH, payload: { jobseeker } });

  onUploadProgress();
}

function* uploadJobPitch({ payload: { data, onUploadProgress, success, fail } }) {
  onUploadProgress('Starting upload...');
  let newPitch = yield call(postRequest({ url: `/api/job-videos/` }), {});
  if (!newPitch) {
    fail && fail(`Upload failed`);
    return;
  }

  try {
    yield call(_uploadPitch, newPitch, data, onUploadProgress);
  } catch (error) {
    fail && fail(`Upload failed`);
    return;
  }

  onUploadProgress('Processing...');
  const pitchId = newPitch.id;
  do {
    yield delay(2000);
    newPitch = yield call(getRequest({ url: `/api/pitches/${pitchId}/` }));
  } while (!newPitch.video);

  const { auth } = yield select();
  const jobseeker = yield call(getRequest({ url: `/api/job-seekers/${auth.jobseeker.id}/` }));
  yield put({ type: C.UPDATE_AUTH, payload: { jobseeker } });

  onUploadProgress();
}

export default function* sagas() {
  yield takeLatest(C.JS_UPLOAD_PITCH, uploadPitch);
  yield takeLatest(C.JS_UPLOAD_JOBPITCH, uploadJobPitch);
}

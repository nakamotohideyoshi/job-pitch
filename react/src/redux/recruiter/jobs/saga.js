import { delay } from 'redux-saga';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import request, { getRequest, postRequest, deleteRequest } from 'utils/request';
import AWS from 'aws-sdk';

export const getJobs = getRequest({
  type: C.RC_GET_JOBS,
  url: '/api/user-jobs/'
});

const removeJob = deleteRequest({
  url: ({ id }) => `/api/user-jobs/${id}/`
});

function* saveJob(action) {
  const { data, logo, onProgress, onSuccess, onFail } = action.payload;

  const job = yield call(
    request({
      method: data.id ? 'put' : 'post',
      url: data.id ? `/api/user-jobs/${data.id}/` : '/api/user-jobs/'
    }),
    action
  );

  if (!job) {
    onFail && onFail('Removing is failed.');
    return;
  }

  if (logo) {
    if (logo.file) {
      const image = yield call(postRequest({ url: '/api/user-job-images/' }), {
        payload: {
          isFormData: true,
          data: {
            order: 0,
            job: job.id,
            image: logo.file
          },
          onUploadProgress: onProgress
        }
      });

      if (!image) {
        onFail && onFail('Uploading logo is failed.');
        onSuccess && onSuccess(job);
        return;
      }

      job.images = [image];
    } else if (job.images.length && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-job-images/${job.images[0].id}/` }));
      job.images = [];
    }
  }

  let { rc_jobs: { jobs } } = yield select();
  if (data.id) {
    jobs = helper.updateObj(jobs, job);
  } else {
    jobs = helper.addObj(jobs, job);
  }
  yield put({ type: C.RC_JOBS_UPDATE, payload: { jobs } });

  onSuccess && onSuccess(job);
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
          Key: `${folder}/${token}.${id}.job-videos.${new Date().getTime()}`,
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
        onUploadProgress('Uploading Pitch...', Math.floor(progress.loaded / progress.total * 100));
      });
  });

function* uploadPitch(action) {
  const { job, data, onProgress, onSuccess, onFail } = action.payload;

  onProgress('Starting pitch upload...');
  let newPitch = yield call(postRequest({ url: `/api/job-videos/` }), {
    payload: { data: { job } }
  });

  if (!newPitch) {
    onFail && onFail(`Uploading pitch is failed.`);
    return;
  }

  try {
    yield call(_uploadPitch, newPitch, data, onProgress);
  } catch (error) {
    onFail && onFail(`Uploading pitch is failed.`);
    return;
  }

  onProgress('Processing...');

  const pitchId = newPitch.id;
  do {
    yield delay(2000);
    newPitch = yield call(getRequest({ url: `/api/job-videos/${pitchId}/` }));
  } while (!newPitch.video);
  yield put({ type: C.RC_UPDATE_JOB, payload: { id: job, videos: [newPitch] } });

  onSuccess && onSuccess('Job is saved successfully.');
}

export default function* sagas() {
  yield takeLatest(C.RC_GET_JOBS, getJobs);
  yield takeLatest(C.RC_REMOVE_JOB, removeJob);
  yield takeLatest(C.RC_SAVE_JOB, saveJob);
  yield takeLatest(C.JS_UPLOAD_JOBPITCH, uploadPitch);
}

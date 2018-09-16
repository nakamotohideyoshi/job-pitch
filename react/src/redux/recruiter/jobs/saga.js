import { delay } from 'redux-saga';
import { takeLatest, call, put } from 'redux-saga/effects';

import { updateWorkplace } from 'redux/recruiter/workplaces/saga';
import * as C from 'redux/constants';
import request, { getRequest, postRequest, deleteRequest } from 'utils/request';
import { uploadVideo } from 'utils/aws';

export const getJobs = getRequest({
  type: C.RC_GET_JOBS,
  url: '/api/user-jobs/'
});

export function* updateJob(job) {
  yield call(updateWorkplace, job.location_data);
  yield put({ type: C.RC_UPDATE_JOB, job });
}

function* saveJob(action) {
  const { data, logo, onProgress, onSuccess, onFail } = action.payload;

  const job = yield call(
    request({
      method: data.id ? 'put' : 'post',
      url: data.id ? `/api/user-jobs/${data.id}/` : '/api/user-jobs/'
    }),
    action
  );

  if (job === null) {
    onFail && onFail('There was an error saving the job');
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

      if (image === null) {
        onFail && onFail('There was an error uploading the logo');
      } else {
        job.images = [image];
      }
    } else if (job.images.length && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-job-images/${job.images[0].id}/` }));
      job.images = [];
    }
  }

  yield call(updateJob, job);

  onSuccess && onSuccess(job);
}

const removeJob = deleteRequest({
  url: ({ id }) => `/api/user-jobs/${id}/`
});

function* uploadPitch(action) {
  const { job, data, onProgress, onSuccess, onFail } = action.payload;

  onProgress('Starting pitch upload...');
  let newPitch = yield call(postRequest({ url: `/api/job-videos/` }), {
    payload: { data: { job } }
  });

  if (!newPitch) {
    onFail && onFail(`.`);
    return;
  }

  try {
    yield call(uploadVideo, 'job-videos', newPitch, data, onProgress);
  } catch (error) {
    onFail && onFail('Uploading is failed.');
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
  yield takeLatest(C.RC_SAVE_JOB, saveJob);
  yield takeLatest(C.RC_REMOVE_JOB, removeJob);
  yield takeLatest(C.RC_UPLOAD_JOBPITCH, uploadPitch);
}

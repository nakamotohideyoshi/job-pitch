import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { getRequest, postRequest, putRequest, deleteRequest, requestSuccess } from 'utils/request';

const getJobs = getRequest({
  url: ({ payload }) => `/api/user-jobs/?location=${payload.id}`
});

const removeJob = deleteRequest({
  url: ({ payload }) => `/api/user-jobs/${payload.id}/`,
  payloadOnSuccess: (_, { payload }) => payload
});

function* getJob(action) {
  const { rc_jobs } = yield select();
  const { jobs } = rc_jobs || {};
  const { id, success } = action.payload;
  const job = helper.getItemByID(jobs || [], id);

  if (job) {
    yield put({ type: requestSuccess(C.RC_GET_JOB), payload: job });
    success && success(job);
  } else {
    yield call(getRequest({ url: `/api/user-jobs/${id}/` }), action);
  }
}

function* saveJob(action) {
  const { data, logo, onSuccess, onFail, onUploading } = action.payload;

  let job;
  if (!data.id) {
    job = yield call(postRequest({ url: '/api/user-jobs/' }), action);
  } else {
    job = yield call(putRequest({ url: `/api/user-jobs/${data.id}/` }), action);
  }

  if (!job) {
    return onFail && onFail('Save filed');
  }

  if (logo) {
    if (logo.file) {
      const image = yield call(postRequest({ url: '/api/user-job-images/' }), {
        payload: {
          formData: true,
          data: {
            order: 0,
            job: job.id,
            image: logo.file
          },
          onUploadProgress: onUploading
        }
      });

      onUploading && onUploading();

      if (image) {
        job.images = [image];
      } else {
        onFail('Logo upload failed!');
      }
    } else if (job.images.length > 0 && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-job-images/${job.images[0].id}/` }));
      job.images = [];
    }
  }

  onSuccess && onSuccess(job);
}

export default function* sagas() {
  yield takeLatest(C.RC_GET_JOBS, getJobs);
  yield takeLatest(C.RC_REMOVE_JOB, removeJob);
  yield takeLatest(C.RC_GET_JOB, getJob);
  yield takeLatest(C.RC_SAVE_JOB, saveJob);
}

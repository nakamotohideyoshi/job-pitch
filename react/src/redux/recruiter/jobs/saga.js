import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import request, { getRequest, postRequest, deleteRequest } from 'utils/request';

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

export default function* sagas() {
  yield takeLatest(C.RC_GET_JOBS, getJobs);
  yield takeLatest(C.RC_REMOVE_JOB, removeJob);
  yield takeLatest(C.RC_SAVE_JOB, saveJob);
}

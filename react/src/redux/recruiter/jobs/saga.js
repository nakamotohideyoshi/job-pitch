import { delay } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import { FormComponent } from 'components';
import { SDATA } from 'utils/data';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

/**
|--------------------------------------------------
| upload logo
|--------------------------------------------------
*/

function* uploadLogo(logo, key, object, onUploadProgress) {
  try {
    if (logo.file) {
      const data = yield call(api.formData, {
        order: 0,
        [key]: object.id,
        image: logo.file
      });
      const image = yield call(api.post, `/api/user-${key}-images/`, data, {
        onUploadProgress: progress => {
          onUploadProgress('Uploading...', Math.floor(progress.loaded / progress.total * 100));
        }
      });
      onUploadProgress();
      object.images = [image];
    } else if (object.images.length > 0 && !logo.exist) {
      yield call(api.del, `/api/user-${key}-images/${object.images[0].id}/`);
      object.images = [];
    }
  } catch (errors) {
    onUploadProgress();
  }
}

/**
|--------------------------------------------------
| job load, select, save
|--------------------------------------------------
*/

// load jobs

function* _getJobs({ workplaceId }) {
  try {
    let endpoint = '/api/user-jobs/';
    if (workplaceId !== undefined) {
      endpoint = `${endpoint}?location=${workplaceId}`;
    }
    const jobs = yield call(api.get, endpoint);
    yield put({ type: C.RC_GET_JOBS_SUCCESS, jobs });
  } catch (errors) {
    yield put({ type: C.RC_GET_JOBS_ERROR, errors });
  }
}

function* getJobs() {
  yield takeEvery(C.RC_GET_JOBS, _getJobs);
}

// remove job

function* _removeJob({ jobId }) {
  try {
    yield call(api.del, `/api/user-jobs/${jobId}/`);
    yield put({ type: C.RC_JOB_REMOVE_SUCCESS, jobId });
  } catch (errors) {
    helper.errorNotif('Server Error!');
    yield put({ type: C.RC_JOB_REMOVE_ERROR, jobId });
  }
}

function* removeJob() {
  yield takeEvery(C.RC_JOB_REMOVE, _removeJob);
}

// update job

function* _updateJob({ model }) {
  try {
    let job = yield call(api.put, `/api/user-jobs/${model.id}/`, model);
    yield put({ type: C.RC_JOB_UPDATE_SUCCESS, job });
  } catch (errors) {
    helper.errorNotif('Server Error!');
    yield put({ type: C.RC_JOB_UPDATE_ERROR, jobId: model.id, errors });
  }
}

function* updateJob() {
  yield takeEvery(C.RC_JOB_UPDATE, _updateJob);
}

// load job

function* _getJob({ jobId }) {
  try {
    let job;
    if (isNaN(jobId)) {
      job = {
        status: helper.getJobStatusByName('CLOSED')
      };
    } else {
      job = yield call(api.get, `/api/user-jobs/${jobId}/`);
    }
    yield put({ type: C.RC_JOB_GET_SUCCESS, job });
  } catch (errors) {
    yield put({ type: C.RC_JOB_GET_ERROR, errors });
  }
}

function* getJob() {
  yield takeEvery(C.RC_JOB_GET, _getJob);
}

// save job

function* _saveJob({ model, logo, onUploadProgress }) {
  try {
    let job;

    // save job
    if (model.id) {
      job = yield call(api.put, `/api/user-jobs/${model.id}/`, model);
    } else {
      job = yield call(api.post, '/api/user-jobs/', model);
    }

    // upload logo
    if (logo) {
      yield call(uploadLogo, logo, 'job', job, onUploadProgress);
    }

    yield put({ type: C.RC_JOB_SAVE_SUCCESS, job });
    FormComponent.modified = false;
    helper.successNotif('Job saved successfully!!');
  } catch (errors) {
    yield put({ type: C.RC_JOB_SAVE_ERROR, errors });
  }
}

function* saveJob() {
  yield takeEvery(C.RC_JOB_SAVE, _saveJob);
}

export default [getJobs(), removeJob(), updateJob(), getJob(), saveJob()];

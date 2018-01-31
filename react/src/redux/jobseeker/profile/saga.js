import { delay } from 'redux-saga';
import { takeEvery, put, call, select } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { FormComponent } from 'components';
import { MENU_DATA, SDATA } from 'utils/data';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as AUTH from 'redux/auth/constants';
import * as C from './constants';

/**
|--------------------------------------------------
| loadProfile
|--------------------------------------------------
*/

function* _loadProfile() {
  try {
    let jobseeker;
    if (!SDATA.user.job_seeker) {
      // new
      jobseeker = {
        active: true,
        email_public: true,
        telephone_public: true,
        mobile_public: true,
        age_public: true,
        sex_public: true,
        nationality_public: true,
        user: SDATA.user.id,
        email: SDATA.user.email,
        age: null
      };
    } else {
      // get
      jobseeker = yield call(api.get, `/api/job-seekers/${SDATA.user.job_seeker}/`);
    }
    yield put({ type: C.JS_PROFILE_LOAD_SUCESS, jobseeker });
  } catch (errors) {
    yield put({ type: C.JS_PROFILE_LOAD_ERROR, errors });
  }
}

function* loadProfile() {
  yield takeEvery(C.JS_PROFILE_LOAD, _loadProfile);
}

/**
|--------------------------------------------------
| saveProfile
|--------------------------------------------------
*/

function* _saveProfile({ model, pitchData, onUploadProgress }) {
  let jobseeker;

  // save profile
  try {
    if (model.id) {
      jobseeker = yield call(api.put, `/api/job-seekers/${model.id}/`, model);
    } else {
      jobseeker = yield call(api.post, '/api/job-seekers/', model);
    }
  } catch (errors) {
    yield put({ type: C.JS_PROFILE_SAVE_ERROR, errors });
    return;
  }

  // upload pitch
  if (!pitchData) {
    yield put({ type: C.JS_PROFILE_SAVE_SUCCESS, jobseeker });
  } else {
    try {
      yield call(_uploadPitch, {
        jobseekerId: jobseeker.id,
        pitchData,
        onUploadProgress
      });
    } catch (errors) {
      helper.errorNotif('Pitch uploading error!!');
    }
  }

  FormComponent.modified = false;
  helper.successNotif('Profile saved successfully!!');

  // update store
  if (!model.id) {
    SDATA.user.job_seeker = jobseeker.id;
    yield put({ type: AUTH.UPDATE_INFO, permission: 1 });
    yield put(push(MENU_DATA.jobseeker.home[1].to));
  }
}

function* saveProfile() {
  yield takeEvery(C.JS_PROFILE_SAVE, _saveProfile);
}

/**
|--------------------------------------------------
| uploadPitch
|--------------------------------------------------
*/

function* _uploadPitch({ type, jobseekerId, pitchData, onUploadProgress }) {
  try {
    onUploadProgress('Starting upload...');
    const newPitch = yield call(api.post, '/api/pitches/', {});
    yield call(api.uploadPitch, newPitch, pitchData, onUploadProgress);
    onUploadProgress('Processing...');
    let pitch;
    do {
      yield delay(2000);
      pitch = yield call(api.get, `/api/pitches/${newPitch.id}/`);
    } while (!pitch.video);
    onUploadProgress();
    const jobseeker = yield call(api.get, `/api/job-seekers/${jobseekerId}/`);
    yield put({ type: C.JS_PROFILE_SAVE_SUCCESS, jobseeker });

    if (type) {
      FormComponent.modified = false;
      helper.successNotif('Profile saved successfully!!');
    }
  } catch (errors) {
    onUploadProgress();
    yield put({ type: C.JS_PROFILE_SAVE_ERROR, errors });
  }
}

function* uploadPitch() {
  yield takeEvery(C.JS_PITCH_UPLOAD, _uploadPitch);
}

export default [loadProfile(), saveProfile(), uploadPitch()];

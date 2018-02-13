import { takeEvery, put, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { FormComponent } from 'components';
import { MENU_DATA, SDATA } from 'utils/data';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as AUTH from 'redux/auth/constants';
import * as C from './constants';

/**
|--------------------------------------------------
| loadJobProfile
|--------------------------------------------------
*/

function* _loadJobProfile() {
  try {
    const jobseeker = yield call(api.get, `/api/job-seekers/${SDATA.user.job_seeker}/`);
    let profile;
    if (!jobseeker.profile) {
      // new
      profile = {
        job_seeker: SDATA.user.job_seeker,
        search_radius: SDATA.searchRadius[2].id
      };
    } else {
      // get
      profile = yield call(api.get, `/api/job-profiles/${jobseeker.profile}/`);
    }
    profile.contract = profile.contract || -1;
    profile.hours = profile.hours || -1;
    yield put({ type: C.JS_JOBPROFILE_LOAD_SUCESS, profile });
  } catch (errors) {
    yield put({ type: C.JS_JOBPROFILE_LOAD_ERROR, errors });
  }
}

function* loadJobProfile() {
  yield takeEvery(C.JS_JOBPROFILE_LOAD, _loadJobProfile);
}

/**
|--------------------------------------------------
| saveJobProfile
|--------------------------------------------------
*/

function* _saveJobProfile({ model }) {
  if (model.contract === -1) model.contract = null;
  if (model.hours === -1) model.hours = null;
  try {
    let profile;
    if (model.id) {
      profile = yield call(api.put, `/api/job-profiles/${model.id}/`, model);
    } else {
      profile = yield call(api.post, '/api/job-profiles/', model);
    }

    // update store
    if (model.id) {
      yield put({ type: C.JS_JOBPROFILE_SAVE_SUCCESS, profile, success: true });
    } else {
      SDATA.user.profile = profile.id;
      yield put({ type: AUTH.UPDATE_INFO, permission: 2 });
      yield put(push('/jobseeker/find'));
    }

    FormComponent.modified = false;
    helper.successNotif('Profile saved successfully!!');
  } catch (errors) {
    yield put({ type: C.JS_JOBPROFILE_SAVE_ERROR, errors });
  }
}

function* saveJobProfile() {
  yield takeEvery(C.JS_JOBPROFILE_SAVE, _saveJobProfile);
}

export default [loadJobProfile(), saveJobProfile()];

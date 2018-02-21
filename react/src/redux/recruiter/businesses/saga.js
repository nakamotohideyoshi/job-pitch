import { delay } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
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
| business load, select, save
|--------------------------------------------------
*/

// load businesses

function* _getBusinesses() {
  try {
    const businesses = yield call(api.get, `/api/user-businesses/`);
    SDATA.jobsStep = yield call(helper.loadData, 'jobs-step');

    yield put({ type: C.RC_GET_BUSINESSES_SUCCESS, businesses });
  } catch (errors) {
    yield put({ type: C.RC_GET_BUSINESSES_ERROR, errors });
  }
}

function* getBusinesses() {
  yield takeEvery(C.RC_GET_BUSINESSES, _getBusinesses);
}

// remove business

function* _removeBusiness({ businessId }) {
  try {
    yield call(api.del, `/api/user-businesses/${businessId}/`);
    yield put({ type: C.RC_BUSINESS_REMOVE_SUCCESS, businessId });
  } catch (errors) {
    helper.errorNotif('Server Error!');
    yield put({ type: C.RC_BUSINESS_REMOVE_ERROR, businessId });
  }
}

function* removeBusiness() {
  yield takeEvery(C.RC_BUSINESS_REMOVE, _removeBusiness);
}

// load business

function* _getBusiness({ businessId }) {
  try {
    let business;
    if (isNaN(businessId)) {
      business = {};
    } else {
      business = yield call(api.get, `/api/user-businesses/${businessId}/`);
    }
    yield put({ type: C.RC_BUSINESS_GET_SUCCESS, business });
  } catch (errors) {
    yield put({ type: C.RC_BUSINESS_GET_ERROR, errors });
  }
}

function* getBusiness() {
  yield takeEvery(C.RC_BUSINESS_GET, _getBusiness);
}

// save business

function* _saveBusiness({ model, logo, onUploadProgress }) {
  try {
    let business;

    // save
    if (model.id) {
      business = yield call(api.put, `/api/user-businesses/${model.id}/`, model);
    } else {
      business = yield call(api.post, '/api/user-businesses/', model);
    }

    // upload logo
    if (logo) {
      yield call(uploadLogo, logo, 'business', business, onUploadProgress);
    }

    yield put({ type: C.RC_BUSINESS_SAVE_SUCCESS, business });
    FormComponent.modified = false;
    helper.successNotif('Business saved successfully!!');

    if (SDATA.jobsStep === 2) {
      yield put(push(`/recruiter/jobs/${business.id}`));
    }
  } catch (errors) {
    yield put({ type: C.RC_BUSINESS_SAVE_ERROR, errors });
  }
}

function* saveBusiness() {
  yield takeEvery(C.RC_BUSINESS_SAVE, _saveBusiness);
}

export default [getBusinesses(), removeBusiness(), getBusiness(), saveBusiness()];

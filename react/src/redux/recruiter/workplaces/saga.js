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
| workplace load, select, save
|--------------------------------------------------
*/

// load workplaces

function* _getWorkplaces({ businessId }) {
  try {
    const workplaces = yield call(api.get, `/api/user-locations/?business=${businessId}`);
    yield put({ type: C.RC_GET_WORKPLACES_SUCCESS, workplaces });
  } catch (errors) {
    yield put({ type: C.RC_GET_WORKPLACES_ERROR, errors });
  }
}

function* getWorkplaces() {
  yield takeEvery(C.RC_GET_WORKPLACES, _getWorkplaces);
}

// remove workplace

function* _removeWorkplace({ workplaceId }) {
  try {
    yield call(api.del, `/api/user-locations/${workplaceId}/`);
    yield put({ type: C.RC_WORKPLACE_REMOVE_SUCCESS, workplaceId });
  } catch (errors) {
    helper.errorNotif('Server Error!');
    yield put({ type: C.RC_WORKPLACE_REMOVE_ERROR, workplaceId });
  }
}

function* removeWorkplace() {
  yield takeEvery(C.RC_WORKPLACE_REMOVE, _removeWorkplace);
}

// load workplace

function* _getWorkplace({ workplaceId }) {
  try {
    let workplace;
    if (isNaN(workplaceId)) {
      workplace = { email: SDATA.user.email };
    } else {
      workplace = yield call(api.get, `/api/user-locations/${workplaceId}/`);
    }
    yield put({ type: C.RC_WORKPLACE_GET_SUCCESS, workplace });
  } catch (errors) {
    yield put({ type: C.RC_WORKPLACE_GET_ERROR, errors });
  }
}

function* getWorkplace() {
  yield takeEvery(C.RC_WORKPLACE_GET, _getWorkplace);
}

// save workplace

function* _saveWorkplace({ model, logo, onUploadProgress }) {
  try {
    let workplace;

    // save
    if (model.id) {
      workplace = yield call(api.put, `/api/user-locations/${model.id}/`, model);
    } else {
      workplace = yield call(api.post, '/api/user-locations/', model);
    }

    // upload logo
    if (logo) {
      yield call(uploadLogo, logo, 'location', workplace, onUploadProgress);
    }

    yield put({ type: C.RC_WORKPLACE_SAVE_SUCCESS, workplace });
    FormComponent.modified = false;
    helper.successNotif('Workplace saved successfully!!');

    if (SDATA.jobsStep === 3) {
      yield put(push(`/recruiter/jobs/${workplace.business_data.id}/${workplace.id}`));
    }
  } catch (errors) {
    yield put({ type: C.RC_WORKPLACE_SAVE_ERROR, errors });
  }
}

function* saveWorkplace() {
  yield takeEvery(C.RC_WORKPLACE_SAVE, _saveWorkplace);
}

export default [getWorkplaces(), removeWorkplace(), getWorkplace(), saveWorkplace()];

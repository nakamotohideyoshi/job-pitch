import { replace } from 'react-router-redux';
import { takeLatest, all, call, put } from 'redux-saga/effects';

import { getRequest, postRequest, putRequest } from 'utils/request';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import DATA from 'utils/data';

function* register(action) {
  yield call(_auth, action, '/api-rest-auth/registration/');
}

function* login(action) {
  yield call(_auth, action, '/api-rest-auth/login/');
}

function* _auth(action, endpoint) {
  const data = yield call(postRequest({ url: endpoint }), action);
  if (data) {
    localStorage.setItem('token', data.key);
    yield put({ type: C.UPDATE_AUTH, payload: { status: 'select' } });
  }
}

function* logout(action) {
  yield put({ type: C.UPDATE_AUTH, payload: { status: 'auth', user: null, jobseeker: null, profile: null } });
  yield put(replace('/auth'));
  if (localStorage.getItem('token')) {
    yield call(postRequest({ url: '/api-rest-auth/logout/' }), action);
    localStorage.removeItem('token');
  }
}

const resetPassword = postRequest({ url: '/api-rest-auth/password/reset/' });

const changePassword = postRequest({ url: '/api-rest-auth/password/change/' });

function* saveJobseeker(action) {
  const { id } = action.payload.data;
  let jobseeker;
  if (!id) {
    jobseeker = yield call(postRequest({ url: '/api/job-seekers/' }), action);
  } else {
    jobseeker = yield call(putRequest({ url: `/api/job-seekers/${id}/` }), action);
  }
  if (jobseeker) {
    yield put({ type: C.UPDATE_AUTH, payload: { jobseeker } });
  }
}

function* saveJobProfile(action) {
  const { id } = action.payload.data;
  let profile;
  if (!id) {
    profile = yield call(postRequest({ url: '/api/job-profiles/' }), action);
  } else {
    profile = yield call(putRequest({ url: `/api/job-profiles/${id}/` }), action);
  }
  if (profile) {
    yield put({ type: C.UPDATE_AUTH, payload: { profile } });
  }
}

function* getUserData() {
  if (!DATA.initTokens) {
    const result = yield all([
      call(getRequest({ url: '/api/initial-tokens/' })),
      call(getRequest({ url: '/api/sectors/' })),
      call(getRequest({ url: '/api/contracts/' })),
      call(getRequest({ url: '/api/hours/' })),
      call(getRequest({ url: '/api/nationalities/' })),
      call(getRequest({ url: '/api/application-statuses/' })),
      call(getRequest({ url: '/api/job-statuses/' })),
      call(getRequest({ url: '/api/sexes/' })),
      call(getRequest({ url: '/api/roles/' })),
      call(getRequest({ url: '/api/paypal-products/' }))
    ]);

    DATA.initTokens = result[0];
    DATA.sectors = result[1];
    DATA.contracts = result[2];
    DATA.hours = result[3];
    DATA.nationalities = result[4];
    DATA.appStatuses = result[5];
    DATA.jobStatuses = result[6];
    DATA.sexes = result[7];
    DATA.roles = result[8];
    DATA.paypalProducts = result[9];

    DATA.JOB = {
      OPEN: helper.getJobStatusByName('OPEN'),
      CLOSED: helper.getJobStatusByName('CLOSED')
    };

    DATA.APP = {
      CREATED: helper.getIDByName('appStatuses', 'CREATED'),
      ESTABLISHED: helper.getIDByName('appStatuses', 'ESTABLISHED'),
      DELETED: helper.getIDByName('appStatuses', 'DELETED')
    };
  }

  const user = yield call(getRequest({ url: '/api-rest-auth/user/' }));
  DATA.email = user.email;

  const jobseekerId = user.job_seeker;
  const jobseeker = jobseekerId ? yield call(getRequest({ url: `/api/job-seekers/${jobseekerId}/` })) : null;

  const profileId = (jobseeker || {}).profile;
  const profile = profileId ? yield call(getRequest({ url: `/api/job-profiles/${profileId}/` })) : null;

  yield put({ type: C.UPDATE_AUTH, payload: { user, jobseeker, profile } });
}

export default function* sagas() {
  yield takeLatest(C.REGISTER, register);
  yield takeLatest(C.LOGIN, login);
  yield takeLatest(C.LOGOUT, logout);
  yield takeLatest(C.RESET_PASSWORD, resetPassword);
  yield takeLatest(C.CHANGE_PASSWORD, changePassword);
  yield takeLatest(C.GET_USERDATA, getUserData);

  yield takeLatest(C.JS_SAVE_PROFILE, saveJobseeker);
  yield takeLatest(C.JS_SAVE_JOBPROFILE, saveJobProfile);
}

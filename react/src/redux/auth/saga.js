import { replace } from 'react-router-redux';
import { takeLatest, all, call, put, select } from 'redux-saga/effects';

import { getRequest, postRequest, requestSuccess } from 'utils/request';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { getBusinesses } from 'redux/recruiter/businesses/saga';
import { getWorkplaces } from 'redux/recruiter/workplaces/saga';
import { getJobs } from 'redux/recruiter/jobs/saga';
import { getApplications } from 'redux/applications/saga';
import * as C from 'redux/constants';

function* register(action) {
  yield call(_auth, action, '/api-rest-auth/registration/');
}

function* login(action) {
  yield call(_auth, action, '/api-rest-auth/login/');
}

function* _auth(action, url) {
  const data = yield call(postRequest({ url }), action);
  if (data) {
    localStorage.setItem('token', data.key);

    const { router } = yield select();
    const { apply } = helper.parseUrlParams(router.location.search);
    if (apply) {
      localStorage.setItem(`${action.payload.data.email}_apply`, apply);
    } else {
      localStorage.removeItem(`${action.payload.data.email}_apply`);
    }

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
  DATA.email = undefined;
  DATA.userRole = undefined;
}

const resetPassword = postRequest({
  url: '/api-rest-auth/password/reset/'
});

const changePassword = postRequest({
  url: '/api-rest-auth/password/change/'
});

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
      OPEN: DATA.jobStatuses.filter(({ name }) => name === 'OPEN')[0].id,
      CLOSED: DATA.jobStatuses.filter(({ name }) => name === 'CLOSED')[0].id
    };

    DATA.APP = {
      CREATED: DATA.appStatuses.filter(({ name }) => name === 'CREATED')[0].id,
      ESTABLISHED: DATA.appStatuses.filter(({ name }) => name === 'ESTABLISHED')[0].id,
      DELETED: DATA.appStatuses.filter(({ name }) => name === 'DELETED')[0].id
    };
  }

  const user = yield call(getRequest({ url: '/api-rest-auth/user/' }));
  DATA.email = user.email;

  const jobseekerId = user.job_seeker;
  if (jobseekerId) {
    DATA.userRole = 'JOB_SEEKER';
    const jobseeker = jobseekerId ? yield call(getRequest({ url: `/api/job-seekers/${jobseekerId}/` })) : null;
    const profileId = (jobseeker || {}).profile;
    const profile = profileId ? yield call(getRequest({ url: `/api/job-profiles/${profileId}/` })) : null;
    yield put({ type: requestSuccess(C.JS_SAVE_PROFILE), payload: jobseeker });
    yield put({ type: requestSuccess(C.JS_SAVE_JOBPROFILE), payload: profile });
  } else {
    DATA.userRole = 'RECRUITER';
    yield all([call(getBusinesses), call(getWorkplaces), call(getJobs)]);
  }

  yield call(getApplications);

  yield put({ type: C.UPDATE_AUTH, payload: { user } });
}

export default function* sagas() {
  yield takeLatest(C.REGISTER, register);
  yield takeLatest(C.LOGIN, login);
  yield takeLatest(C.LOGOUT, logout);
  yield takeLatest(C.RESET_PASSWORD, resetPassword);
  yield takeLatest(C.CHANGE_PASSWORD, changePassword);
  yield takeLatest(C.GET_USERDATA, getUserData);
}

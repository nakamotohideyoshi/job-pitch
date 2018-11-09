import { takeLatest, all, call, put } from 'redux-saga/effects';

import { getRequest, postRequest, requestSuccess } from 'utils/request';
import DATA from 'utils/data';
import * as C from 'redux/constants';
import { getBusinesses } from 'redux/businesses/saga';
import { getWorkplaces } from 'redux/workplaces/saga';

const register = postRequest({
  url: '/api-rest-auth/registration/'
});

const login = postRequest({
  url: '/api-rest-auth/login/'
});

const logout = postRequest({
  url: '/api-rest-auth/logout/'
});

const resetPassword = postRequest({
  url: '/api-rest-auth/password/reset/'
});

const changePassword = postRequest({
  url: '/api-rest-auth/password/change/'
});

function* loadData(action) {
  if (action) {
    DATA.userKey = action.payload.key;
  } else if (!DATA.userKey) return;

  const user = yield call(getRequest({ url: '/api-rest-auth/user/' }));
  DATA.email = user.email;

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
  }

  let jobseeker, jobProfile;
  if (user.job_seeker) {
    jobseeker = yield call(getRequest({ url: `/api/job-seekers/${user.job_seeker}/` }));
    if ((jobseeker || {}).profile) {
      jobProfile = yield call(getRequest({ url: `/api/job-profiles/${jobseeker.profile}/` }));
    }
    DATA.userRole = DATA.JOBSEEKER;
  } else if (user.businesses.length) {
    yield all([call(getBusinesses), call(getWorkplaces)]);
    DATA.userRole = DATA.RECRUITER;
  }

  yield put({ type: C.UPDATE_AUTH, payload: { user, jobseeker, jobProfile } });
}

export default function*() {
  yield takeLatest(C.REGISTER, register);
  yield takeLatest(C.LOGIN, login);
  yield takeLatest(C.LOGOUT, logout);
  yield takeLatest(C.RESET_PASSWORD, resetPassword);
  yield takeLatest(C.CHANGE_PASSWORD, changePassword);
  yield takeLatest([requestSuccess(C.LOGIN), requestSuccess(C.REGISTER)], loadData);
  yield call(loadData);
}

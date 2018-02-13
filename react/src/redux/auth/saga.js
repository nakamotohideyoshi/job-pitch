import { take, takeEvery, fork, put, call, cancel, select } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { push } from 'react-router-redux';
import { MENU_DATA, SDATA } from 'utils/data';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

/**
|--------------------------------------------------
| getUserData
|--------------------------------------------------
*/

function* getUserData(token, usertype) {
  yield call(api.setToken, token);
  // load server data
  let user;
  try {
    user = yield call(api.get, '/api-rest-auth/user/');
    SDATA.user = user;
    if (!SDATA.initTokens) {
      const result = yield [
        call(api.get, '/api/initial-tokens/'),
        call(api.get, '/api/sectors/'),
        call(api.get, '/api/contracts/'),
        call(api.get, '/api/hours/'),
        call(api.get, '/api/nationalities/'),
        call(api.get, '/api/application-statuses/'),
        call(api.get, '/api/job-statuses/'),
        call(api.get, '/api/sexes/'),
        call(api.get, '/api/roles/'),
        call(api.get, '/api/paypal-products/')
      ];
      SDATA.initTokens = result[0];
      SDATA.sectors = result[1];
      SDATA.contracts = result[2];
      SDATA.hours = result[3];
      SDATA.nationalities = result[4];
      SDATA.appStatuses = result[5];
      SDATA.jobStatuses = result[6];
      SDATA.sexes = result[7];
      SDATA.roles = result[8];
      SDATA.paypalProducts = result[9];
    }
  } catch (errors) {
    throw errors;
  }

  // get login state
  let loginState;
  if (user.businesses.length > 0) {
    loginState = 'recruiter';
  } else if (user.job_seeker) {
    loginState = 'jobseeker';
  } else {
    loginState = usertype || (yield call(helper.loadData, 'user-type'));
    loginState = loginState || 'select';
  }

  // get permission
  let jobseeker;
  let permission = 0;
  if (user.businesses.length > 0) {
    permission = 1;
  } else if (user.job_seeker) {
    try {
      jobseeker = yield call(api.get, `/api/job-seekers/${user.job_seeker}/`);
    } catch (errors) {
      throw errors;
    }
    permission = jobseeker.profile ? 2 : 1;
    SDATA.user.profile = jobseeker.profile;
  }

  // store data
  yield put({
    type: C.LOGIN_SUCCESS,
    loginState,
    user,
    jobseeker,
    permission
  });

  // get redirect path
  let redirect = MENU_DATA[loginState].redirect[permission].to;

  return { loginState, permission, redirect };
}

/**
|--------------------------------------------------
| initLoad
|--------------------------------------------------
*/

function getPathInfo(items, pathname) {
  for (let i = 0; i < items.length; i++) {
    const info = items[i];
    if (info.items) {
      const result = getPathInfo(info.items, pathname);
      if (result) {
        return result;
      }
    }

    let to = info.to;
    if (to && to.slice(-1) === '/') {
      to = to.slice(0, -1);
    }
    if ((to === '' && pathname === '/') || (to !== '' && pathname.indexOf(to) === 0)) {
      return info;
    }
  }
  return null;
}

function* _loadAuth() {
  // load token
  let token = yield call(api.loadToken);
  // get data
  let data;
  if (token) {
    try {
      data = yield call(getUserData, token);
    } catch (errors) {
      yield call(api.setToken);
    }
  }

  if (!data) {
    data = { loginState: 'none', permission: 0, redirect: '/auth' };
    yield put({ type: C.LOGOUT });
  }

  // // check current path
  const { router } = yield select();
  const { pathname } = router.location;
  const menuData = MENU_DATA[data.loginState];
  const paths = menuData.left.concat(menuData.right, menuData.redirect);
  const pathInfo = getPathInfo(paths, pathname);
  if (!pathInfo || (pathInfo.permission || 0) > data.permission) {
    yield put(push(data.redirect));
  }

  return data.loginState;
}

/**
|--------------------------------------------------
| register
|--------------------------------------------------
*/

function* _register(model, usertype) {
  try {
    const { key } = yield call(api.post, '/api-rest-auth/registration/', model);
    
    if (usertype === 'recruiter') {
      yield call(helper.saveData, 'jobs-step', 1);
    }

    const { redirect } = yield call(getUserData, key, usertype);
    yield put(push(redirect));
  } catch (errors) {
    yield put({ type: C.LOGIN_ERROR, errors });
  }
  // const loginModel = { email: model.email, password: model.password1 };
  // yield call(_login, loginModel, usertype);
}

/**
|--------------------------------------------------
| login
|--------------------------------------------------
*/

function* _login(model, usertype) {
  try {
    const { key } = yield call(api.post, '/api-rest-auth/login/', model);
    const { redirect } = yield call(getUserData, key, usertype);
    yield put(push(redirect));
  } catch (errors) {
    yield put({ type: C.LOGIN_ERROR, errors });
  }
}

/**
|--------------------------------------------------
| logout
|--------------------------------------------------
*/

function* _logout() {
  // yield call(api.get, '/api-rest-auth/logout/');
  yield call(api.setToken);
  delete SDATA.user;
  yield put(push('/auth'));
}

/**
|--------------------------------------------------
| loginFlow
|--------------------------------------------------
*/

function* loginFlow() {
  // yield call(clearToken);
  let loginState = yield call(_loadAuth);

  while (true) {
    let task;
    if (loginState === 'none') {
      const { type, model, usertype } = yield take([C.REGISTER, C.LOGIN]);
      if (type === C.REGISTER) {
        task = yield fork(_register, model, usertype);
      } else {
        task = yield fork(_login, model);
      }
    }

    const { type } = yield take([C.LOGIN_ERROR, C.LOGOUT]);
    if (type === C.LOGOUT) {
      yield _logout();
    }
    loginState = 'none';
  }
}

/**
|--------------------------------------------------
| select usertype
|--------------------------------------------------
*/

function* _selectUserType({ usertype }) {
  yield call(helper.saveData, 'user-type', usertype);

  if (usertype === 'recruiter') {
    yield call(helper.saveData, 'jobs-step', 1);
    yield put(push('/recruiter/jobs'));
  } else {
    yield put(push('/jobseeker/profile'));
  }
}

function* selectUserType() {
  yield takeEvery(C.SELECT_USERTYPE, _selectUserType);
}

export default [loginFlow(), selectUserType()];

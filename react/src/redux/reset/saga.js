import { takeEvery, put, call } from 'redux-saga/effects';
import * as api from 'utils/api';
import * as C from './constants';

function* _resetPassword({ model }) {
  try {
    const { success } = yield call(api.post, '/api-rest-auth/password/reset/', model);
    yield put({ type: C.RESET_PASSWORD_SUCCESS, success });
  } catch (errors) {
    yield put({ type: C.RESET_PASSWORD_ERROR, errors });
  }
}

function* resetPassword() {
  yield takeEvery(C.RESET_PASSWORD, _resetPassword);
}

export default [resetPassword()];

import { takeEvery, put, call } from 'redux-saga/effects';
import * as api from 'utils/api';
import * as C from './constants';

function* _changePassword({ model }) {
  try {
    const { success } = yield call(api.post, '/api-rest-auth/password/change/', model);
    yield put({ type: C.CHANGE_PASSWORD_SUCCESS, success });
  } catch (errors) {
    yield put({ type: C.CHANGE_PASSWORD_ERROR, errors });
  }
}

function* changePassword() {
  yield takeEvery(C.CHANGE_PASSWORD, _changePassword);
}

export default [changePassword()];

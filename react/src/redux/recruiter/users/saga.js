import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import request, { getRequest, deleteRequest } from 'utils/request';

export const getUsers = getRequest({
  type: C.RC_GET_USERS,
  url: ({ id }) => `/api/user-businesses/${id}/users/`
});

const removeUser = deleteRequest({
  url: ({ id, business }) => `/api/user-businesses/${business}/users/${id}/`
});

function* saveUser(action) {
  const { businessId, userId, onSuccess, onFail } = action.payload;

  const user = yield call(
    request({
      method: userId ? 'put' : 'post',
      url: userId ? `/api/user-businesses/${businessId}/users/${userId}/` : `/api/user-businesses/${businessId}/users/`
    }),
    action
  );

  if (!user) {
    onFail && onFail('Saving is failed.');
    return;
  }

  let { rc_users: { users } } = yield select();
  if (userId) {
    users = helper.updateObj(users, user);
  } else {
    users = helper.addObj(users, user);
  }

  yield put({ type: C.RC_USERS_UPDATE, payload: { users } });

  onSuccess && onSuccess(user);
}

export default function* sagas() {
  yield takeLatest(C.RC_GET_USERS, getUsers);
  yield takeLatest(C.RC_REMOVE_USER, removeUser);
  yield takeLatest(C.RC_SAVE_USER, saveUser);
}

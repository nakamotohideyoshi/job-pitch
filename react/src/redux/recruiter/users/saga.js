import { takeLatest } from 'redux-saga/effects';

import { request, weakRequest, getRequest, postRequest, deleteRequest } from 'utils/request';
import * as C from 'redux/constants';

const getUsers = weakRequest(
  getRequest({
    url: id => `/api/user-businesses/${id}/users/`
  })
);

const saveUser = request({
  method: ({ id }) => (id ? 'put' : 'post'),
  url: ({ id, businessId }) =>
    id ? `/api/user-businesses/${businessId}/users/${id}/` : `/api/user-businesses/${businessId}/users/`
});

const resendInvitation = postRequest({
  url: ({ id, businessId }) => `/api/user-businesses/${businessId}/users/${id}/resend-invitation/`
});

const removeUser = deleteRequest({
  url: ({ id, business }) => `/api/user-businesses/${business}/users/${id}/`
});

export default function* sagas() {
  yield takeLatest(C.RC_GET_USERS, getUsers);
  yield takeLatest(C.RC_SAVE_USER, saveUser);
  yield takeLatest(C.RC_RESEND_INVITATION, resendInvitation);
  yield takeLatest(C.RC_REMOVE_USER, removeUser);
}

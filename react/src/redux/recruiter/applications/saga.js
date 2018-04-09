import { takeLatest, call, race, take, all } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from 'redux/constants';
import { getRequest, postRequest, putRequest, deleteRequest } from 'utils/request1';
import DATA from 'utils/data';

function* getData() {
  yield race({
    result: all([
      call(
        getRequest({
          url: '/api/user-jobs/',
          success: jobs => ({ jobs }),
          fail: error => ({ jobs: error })
        }),
        { type: C.RC_GET_APPS1 }
      ),
      call(
        getRequest({
          url: '/api/applications/',
          success: applications => ({ applications }),
          fail: error => ({ applications: error })
        }),
        { type: C.RC_GET_APPS1 }
      )
    ]),
    cancel: take(LOCATION_CHANGE)
  });
}

const connectApplication = putRequest({
  url: ({ payload: { id } }) => `/api/applications/${id}/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => ({
    id: payload.id,
    status: DATA.APP.ESTABLISHED
  })
});

const updateApplication = putRequest({
  url: ({ payload: { id } }) => `/api/applications/${id}/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => payload
});

const removeApplication = deleteRequest({
  url: ({ payload: { id } }) => `/api/applications/${id}/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => payload
});

// function* sendMessage(action) {
//   result =
// }

const sendMessage = postRequest({
  url: '/api/messages/'
});

export default function* sagas() {
  yield takeLatest(C.RC_GET_APPS1, getData);
  yield takeLatest(C.RC_CONNECT_APP1, connectApplication);
  yield takeLatest(C.RC_UPDATE_APP1, updateApplication);
  yield takeLatest(C.RC_REMOVE_APP1, removeApplication);
  yield takeLatest(C.RC_SEND_MESSAGE, sendMessage);
}

import { takeLatest, call, put, race, take } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { getRequest, postRequest, putRequest, deleteRequest, requestSuccess, requestFail } from 'utils/request1';
import DATA from 'utils/data';
import * as C from 'redux/constants';

function* getApplications(action) {
  yield race({
    result: call(getRequest({ url: '/api/applications/' }), action),
    cancel: take(LOCATION_CHANGE)
  });
}

const connectApplication = putRequest({
  url: ({ payload }) => `/api/applications/${payload.data.id}/`,
  success: (_, { payload }) => ({
    data: {
      id: payload.data.id,
      status: DATA.APP.ESTABLISHED
    }
  }),
  fail: (_, { payload }) => ({
    data: {
      id: payload.data.id
    }
  })
});

const updateApplication = putRequest({
  url: ({ payload }) => `/api/applications/${payload.data.id}/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => payload
});

const removeApplication = deleteRequest({
  url: ({ payload }) => `/api/applications/${payload.id}/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => payload
});

function* sendMessage({ payload }) {
  const result = yield call(postRequest({ url: '/api/messages/' }), { payload });
  if (result) {
    const application = yield call(getRequest({ url: `/api/applications/${payload.data.application}/` }));
    if (application) {
      yield put({ type: requestSuccess(C.RC_SEND_MESSAGE), payload: { application } });
      return;
    }
  }
  yield put({ type: requestFail(C.RC_SEND_MESSAGE), payload });
}

export default function* sagas() {
  yield takeLatest(C.RC_GET_APPS1, getApplications);
  yield takeLatest(C.RC_CONNECT_APP1, connectApplication);
  yield takeLatest(C.RC_UPDATE_APP1, updateApplication);
  yield takeLatest(C.RC_REMOVE_APP1, removeApplication);
  yield takeLatest(C.RC_SEND_MESSAGE, sendMessage);
}

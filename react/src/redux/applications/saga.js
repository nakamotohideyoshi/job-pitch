import { takeLatest, call, put, race, take } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { getRequest, postRequest, putRequest, deleteRequest, requestSuccess, requestFail } from 'utils/request';
import DATA from 'utils/data';
import * as C from 'redux/constants';

function* getApplications(action) {
  yield race({
    result: call(getRequest({ url: '/api/applications/' }), action),
    cancel: take(LOCATION_CHANGE)
  });
}

const connectApplication = putRequest({
  url: ({ data }) => `/api/applications/${data.id}/`,
  // payloadOnSuccess: ({ data }) => ({
  //   data: {
  //     id: data.id,
  //     status: DATA.APP.ESTABLISHED
  //   }
  // }),
  // payloadOnFail: ({ data }) => ({
  //   data: {
  //     id: data.id
  //   }
  // })
});

const updateApplication = putRequest({
  url: ({ data }) => `/api/applications/${data.id}/`
});

const removeApplication = deleteRequest({
  url: ({ id }) => `/api/applications/${id}/`
});

function* sendMessage({ payload }) {
  const result = yield call(postRequest({ url: '/api/messages/' }), { payload });
  if (result) {
    const application = yield call(getRequest({ url: `/api/applications/${payload.data.application}/` }));
    if (application) {
      yield put({ type: requestSuccess(C.SEND_MESSAGE), payload: { application } });
      return;
    }
  }
  yield put({ type: requestFail(C.SEND_MESSAGE), payload });
}

export default function* sagas() {
  yield takeLatest(C.GET_APPLICATIONS, getApplications);
  yield takeLatest(C.CONNECT_APPLICATION, connectApplication);
  yield takeLatest(C.UPDATE_APPLICATION, updateApplication);
  yield takeLatest(C.REMOVE_APPLICATION, removeApplication);
  yield takeLatest(C.SEND_MESSAGE, sendMessage);
}

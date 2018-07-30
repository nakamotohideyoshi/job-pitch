import { takeLatest, call, put } from 'redux-saga/effects';
import {
  weakRequest,
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  requestSuccess,
  requestFail
} from 'utils/request';
import DATA from 'utils/data';
import * as C from 'redux/constants';

const getApplications = weakRequest(
  getRequest({
    url: '/api/applications/'
  })
);

const getAllApplications = weakRequest(
  getRequest({
    url: '/api/applications/'
  })
);

const updateApplication = weakRequest(
  putRequest({
    url: ({ id }) => `/api/applications/${id}/`
  })
);

const connectApplication = weakRequest(
  putRequest({
    type: C.UPDATE_APPLICATION,
    url: ({ id }) => `/api/applications/${id}/`,
    payloadOnSuccess: ({ id }) => ({
      id,
      status: DATA.APP.ESTABLISHED
    })
  })
);

const removeApplication = weakRequest(
  deleteRequest({
    type: C.UPDATE_APPLICATION,
    url: ({ id }) => `/api/applications/${id}/`,
    payloadOnSuccess: ({ id }) => ({
      id,
      status: DATA.APP.DELETED
    })
  })
);

function* sendMessage({ payload }) {
  const result = yield call(postRequest({ url: '/api/messages/' }), { payload });
  if (result) {
    const application = yield call(getRequest({ url: `/api/applications/${payload.data.application}/` }));
    if (application) {
      yield put({ type: requestSuccess(C.SEND_MESSAGE), payload: application });
      return;
    }
  }
  yield put({ type: requestFail(C.SEND_MESSAGE), payload });
}

function* updateMessageByInterview({ payload }) {
  const application = yield call(getRequest({ url: `/api/applications/${payload.data.application}/` }));
  if (application) {
    yield put({ type: requestSuccess(C.UPDATE_MESSAGE_BY_INTERVIEW), payload: application });
    return;
  }
  yield put({ type: requestFail(C.UPDATE_MESSAGE_BY_INTERVIEW), payload });
}

export default function* sagas() {
  yield takeLatest(C.GET_APPLICATIONS, getApplications);
  yield takeLatest(C.GET_ALL_APPLICATIONS, getAllApplications);
  yield takeLatest(C.UPDATE_APPLICATION, updateApplication);
  yield takeLatest(C.CONNECT_APPLICATION, connectApplication);
  yield takeLatest(C.REMOVE_APPLICATION, removeApplication);
  yield takeLatest(C.SEND_MESSAGE, sendMessage);
  yield takeLatest(C.UPDATE_MESSAGE_BY_INTERVIEW, updateMessageByInterview);
}

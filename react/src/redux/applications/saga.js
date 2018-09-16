import { takeLatest, call, put, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  requestPending,
  requestSuccess,
  requestFail
} from 'utils/request';
import * as C from 'redux/constants';

export const getApplications = getRequest({
  type: C.GET_APPLICATIONS,
  url: '/api/applications/'
});

function* _updateApplication(process, payload) {
  const { appId, onSuccess, onFail } = payload;
  yield put({ type: requestPending(C.UPDATE_APPLICATION), appId });

  const result = yield call(process, { payload });
  if (result !== null) {
    const application = yield call(getRequest({ url: `/api/applications/${appId || result.id}/` }));
    if (application !== null) {
      yield put({ type: requestSuccess(C.UPDATE_APPLICATION), application });
      onSuccess && onSuccess();
      return;
    }
  }

  yield put({ type: requestFail(C.UPDATE_APPLICATION), appId });
  onFail && onFail();
}

function* updateApplication({ payload }) {
  yield call(_updateApplication, putRequest({ url: `/api/applications/${payload.appId}/` }), payload);
}

function* removeApplication({ payload }) {
  yield call(_updateApplication, deleteRequest({ url: `/api/applications/${payload.appId}/` }), payload);
}

function* newApplication({ payload }) {
  yield call(_updateApplication, postRequest({ url: '/api/applications/external/' }), payload);
}

// message

function* readMessage({ payload }) {
  yield call(_updateApplication, putRequest({ url: `/api/messages/${payload.id}/` }), payload);
}

function* sendMessage({ payload }) {
  yield call(_updateApplication, postRequest({ url: `/api/messages/` }), payload);
}

// interview

function* saveInterview({ payload }) {
  yield call(getRequest({ url: `/api/interviews/` }));
  const { id } = payload.data;
  if (id) {
    yield call(_updateApplication, putRequest({ url: `/api/interviews/${id}/` }), payload);
  } else {
    yield call(_updateApplication, postRequest({ url: '/api/interviews/' }), payload);
  }
}

function* changeInterview({ payload }) {
  const { id, changeType } = payload;
  yield call(_updateApplication, postRequest({ url: `/api/interviews/${id}/${changeType}/` }), payload);
}

function* completeInterview({ payload }) {
  const { id, feedback } = payload.data;
  yield call(
    _updateApplication,
    function*() {
      const result = yield call(postRequest({ url: `/api/interviews/${id}/complete/` }));
      if (result === null) return null;
      if (feedback === '') return '';
      return yield call(putRequest({ url: `/api/interviews/${id}/` }), { payload });
    },
    payload
  );
}

function* removeInterview({ payload }) {
  const { id } = payload;
  yield call(_updateApplication, deleteRequest({ url: `/api/interviews/${id}/` }), payload);
}

// auto update applications

function* autoUpdateAppliciations() {
  let second = 0;
  while (true) {
    yield call(delay, 1000);
    second++;

    let { auth, router } = yield select();

    if (!auth.user || auth.status === 'auth' || auth.status === 'select') {
      second = 0;
      continue;
    }

    const interval = router.location.pathname.split('/')[2] === 'messages' ? 5 : 30;
    if (second < interval) continue;

    second = 0;
    yield call(getApplications);
  }
}

export default function* sagas() {
  yield takeLatest(C.UPDATE_APPLICATION, updateApplication);
  yield takeLatest(C.REMOVE_APPLICATION, removeApplication);
  yield takeLatest(C.NEW_APPLICATION, newApplication);
  yield takeLatest(C.READ_MESSAGE, readMessage);
  yield takeLatest(C.SEND_MESSAGE, sendMessage);

  yield takeLatest(C.SAVE_INTERVIEW, saveInterview);
  yield takeLatest(C.CHANGE_INTERVIEW, changeInterview);
  yield takeLatest(C.COMPLETE_INTERVIEW, completeInterview);
  yield takeLatest(C.REMOVE_INTERVIEW, removeInterview);

  yield autoUpdateAppliciations();
}

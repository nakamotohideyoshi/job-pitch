import { takeEvery, put, call, select } from 'redux-saga/effects';
import { replace } from 'react-router-redux';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

/**
|--------------------------------------------------
| applications
|--------------------------------------------------
*/

function* _getApplications({ jobId, statusName, shortlist }) {
  try {
    let endpoint = `/api/applications/`;
    let c = '?';
    if (jobId !== undefined) {
      endpoint = `${endpoint}${c}job=${jobId}`;
      c = '&';
    }
    if (statusName !== undefined) {
      const status = helper.getIDByName('appStatuses', statusName);
      endpoint = `${endpoint}${c}status=${status}`;
      c = '&';
    }
    if (shortlist !== undefined) {
      endpoint = `${endpoint}${c}shortlisted=${shortlist ? 1 : 0}`;
    }
    const applications = yield call(api.get, endpoint);
    yield put({ type: C.GET_APPLICATIONS_SUCCESS, applications });
  } catch (errors) {
    yield put({ type: C.GET_APPLICATIONS_ERROR, errors });
  }
}

function* getApplications() {
  yield takeEvery(C.GET_APPLICATIONS, _getApplications);
}

// connect application

function* _connectApplication({ appId }) {
  try {
    yield call(api.put, `/api/applications/${appId}/`, {
      id: appId,
      connect: helper.getIDByName('appStatuses', 'ESTABLISHED')
    });
    yield put({ type: C.CONNECT_APPLICATION_SUCCESS, appId });
  } catch (errors) {
    yield put({ type: C.CONNECT_APPLICATION_ERROR, appId });
    helper.errorNotif('Server Error!');
  }
}

function* connectApplication() {
  yield takeEvery(C.CONNECT_APPLICATION, _connectApplication);
}

// remove application

function* _removeApplication({ appId }) {
  try {
    yield call(api.del, `/api/applications/${appId}/`);
    yield put({ type: C.REMOVE_APPLICATION_SUCCESS, appId });
  } catch (errors) {
    yield put({ type: C.REMOVE_APPLICATION_ERROR, appId });
    helper.errorNotif('Server Error!');
  }
}

function* removeApplication() {
  yield takeEvery(C.REMOVE_APPLICATION, _removeApplication);
}

// set shortlist

function* _setShortlist({ shortlisted }) {
  const { applications } = yield select();
  if (applications.selectedApp) {
    const { id } = applications.selectedApp;
    try {
      yield call(api.put, `/api/applications/${id}/`, {
        id,
        shortlisted
      });
      yield put({ type: C.SET_SHORTLIST_SUCCESS, shortlisted });
    } catch (errors) {
      yield put({ type: C.SET_SHORTLIST_ERROR });
      helper.errorNotif('Server Error!');
    }
  }
}

function* setShortlist() {
  yield takeEvery(C.SET_SHORTLIST, _setShortlist);
}

/**
|--------------------------------------------------
| message applications
|--------------------------------------------------
*/

function* _getMsgApplications({ appId }) {
  try {
    const applications = yield call(api.get, '/api/applications/');
    const selectedId = appId || (yield call(helper.loadData, 'messages_app'));
    const selectedApp = helper.getItemByID(applications, selectedId) || applications[0];

    yield put({
      type: C.GET_APPLICATIONS_SUCCESS,
      applications,
      selectedApp
    });

    if (selectedApp) {
      yield call(helper.saveData, 'messages_app', selectedApp.id);
      if (appId !== selectedApp.id) {
        const { auth } = yield select();
        yield put(replace(`/${auth.loginState}/messages/${selectedApp.id}/`));
      }
    }
  } catch (errors) {
    yield put({ type: C.GET_APPLICATIONS_ERROR, errors });
  }
}

function* getMsgApplications() {
  yield takeEvery(C.GET_MSG_APPLICATIONS, _getMsgApplications);
}

// send message

function* _sendMessage({ message }) {
  const { applications } = yield select();
  const appId = applications.selectedApp.id;

  try {
    yield call(api.post, '/api/messages/', {
      application: appId,
      content: message
    });

    const application = yield call(api.get, `/api/applications/${appId}/`);
    yield put({ type: C.SEND_MESSAGE_SUCCESS, application });
  } catch (errors) {
    yield put({ type: C.SEND_MESSAGE_ERROR, appId });
    helper.errorNotif('Server Error!');
  }
}

function* sendMessage() {
  yield takeEvery(C.SEND_MESSAGE, _sendMessage);
}

export default [
  getApplications(),
  connectApplication(),
  removeApplication(),
  setShortlist(),

  getMsgApplications(),
  sendMessage()
];

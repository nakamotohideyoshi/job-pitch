import { takeEvery, put, call, select } from 'redux-saga/effects';
import { replace } from 'react-router-redux';
import * as helper from 'utils/helper';
import * as api from 'utils/api';
import * as C from './constants';

// load applications

function* _getApplications({ appId, withJobs }) {
  try {
    let jobs;
    if (withJobs) {
      jobs = yield call(api.get, '/api/user-jobs/');
    }
    const applications = yield call(api.get, '/api/applications/');
    const selectedId = appId || (yield call(helper.loadData, 'messages_app'));
    const selectedApp = helper.getItemByID(applications, selectedId) || applications[0];

    yield put({
      type: C.MSG_GET_APPLICATIONS_SUCCESS,
      jobs,
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
    yield put({ type: C.MSG_GET_APPLICATIONS_ERROR, errors });
  }
}

function* getApplications() {
  yield takeEvery(C.MSG_GET_APPLICATIONS, _getApplications);
}

// select application

function* _selectApplication({ appId }) {
  const { messages, auth } = yield select();
  const selectedApp = helper.getItemByID(messages.applications, appId);

  yield call(helper.saveData, 'messages_app', selectedApp.id);
  yield put({ type: C.MSG_SELECT_APPLICATION_SUCCESS, selectedApp });
  yield put(replace(`/${auth.loginState}/messages/${selectedApp.id}/`));
}

function* selectApplication() {
  yield takeEvery(C.MSG_SELECT_APPLICATION, _selectApplication);
}

// send message

function* _sendMessage({ message }) {
  const { messages } = yield select();
  const appId = messages.selectedApp.id;

  try {
    yield call(api.post, '/api/messages/', {
      application: appId,
      content: message
    });

    const application = yield call(api.get, `/api/applications/${appId}/`);
    yield put({ type: C.MSG_SEND_MESSAGE_SUCCESS, application });
  } catch (errors) {
    yield put({ type: C.MSG_SEND_MESSAGE_ERROR, appId, errors });
  }
}

function* sendMessage() {
  yield takeEvery(C.MSG_SEND_MESSAGE, _sendMessage);
}

export default [getApplications(), selectApplication(), sendMessage()];

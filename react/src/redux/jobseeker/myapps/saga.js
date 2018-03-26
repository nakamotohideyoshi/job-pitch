import { takeLatest } from 'redux-saga/effects';

import * as C from 'redux/constants';
import { getRequest } from 'utils/request';

const getApplications = getRequest({ type: C.JS_GET_APPS, url: `/api/applications/` });

export default function* sagas() {
  yield takeLatest(C.JS_GET_APPS, getApplications);
}

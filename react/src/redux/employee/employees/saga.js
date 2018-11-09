import { takeLatest, select, call, put } from 'redux-saga/effects';

import { getRequest, requestSuccess } from 'utils/request';
import * as C from 'redux/constants';

function* getEmployees() {
  const { auth } = yield select();
  const ids = auth.user.employees;
  const employees = [];
  for (let i = 0; i < ids.length; i++) {
    const employee = yield call(getRequest({ url: `/api/employee/employees/${ids[i]}/` }));
    employees.push(employee);
  }

  yield put({ type: requestSuccess(C.EM_GET_EMPLOYEES), employees });
}

export default function* sagas() {
  yield takeLatest(C.EM_GET_EMPLOYEES, getEmployees);
}

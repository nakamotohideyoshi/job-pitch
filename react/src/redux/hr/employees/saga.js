import { takeLatest } from 'redux-saga/effects';

import { request, getRequest, deleteRequest } from 'utils/request';
import * as C from 'redux/constants';

export const getEmployees = getRequest({
  type: C.HR_GET_EMPLOYEES,
  url: '/api/hr/employees/'
});

const saveEmployee = request({
  method: ({ id }) => (id ? 'put' : 'post'),
  url: ({ id }) => (id ? `/api/hr/employees/${id}/` : '/api/hr/employees/')
});

const removeEmployee = deleteRequest({
  url: ({ id }) => `/api/hr/employees/${id}/`
});

export default function* sagas() {
  yield takeLatest(C.HR_SAVE_EMPLOYEE, saveEmployee);
  yield takeLatest(C.HR_REMOVE_EMPLOYEE, removeEmployee);
}

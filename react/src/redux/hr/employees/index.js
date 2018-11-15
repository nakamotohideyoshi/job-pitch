import { createAction, handleActions } from 'redux-actions';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const getEmployeesAction = createAction(C.HR_GET_EMPLOYEES);
export const saveEmployeeAction = createAction(C.HR_SAVE_EMPLOYEE);
export const removeEmployeeAction = createAction(C.HR_REMOVE_EMPLOYEE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  employees: null
};

export default handleActions(
  {
    // ---- get employees ----

    [requestSuccess(C.HR_GET_EMPLOYEES)]: (state, { payload }) => ({
      ...state,
      employees: payload
    }),

    // ---- save employee ----

    [requestSuccess(C.HR_SAVE_EMPLOYEE)]: (state, { payload }) => {
      return {
        ...state,
        employees: helper.updateItem(state.employees, payload, true)
      };
    },

    // ---- remove employee ----

    [requestPending(C.HR_REMOVE_EMPLOYEE)]: (state, { payload }) => ({
      ...state,
      employees: helper.updateItem(state.employees, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.HR_REMOVE_EMPLOYEE)]: (state, { request }) => ({
      ...state,
      employees: helper.removeItem(state.employees, request.id)
    }),

    [requestFail(C.HR_REMOVE_EMPLOYEE)]: (state, { request }) => ({
      ...state,
      employees: helper.updateItem(state.employees, {
        id: request.id,
        loading: false
      })
    }),

    // ---- log out ----

    [C.LOGOUT]: () => initialState
  },
  initialState
);

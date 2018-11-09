import { createAction, handleActions } from 'redux-actions';

import { requestSuccess } from 'utils/request';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const getEmployeesAction = createAction(C.EM_GET_EMPLOYEES);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  employees: null
};

export default handleActions(
  {
    // ---- get employees ----

    [requestSuccess(C.EM_GET_EMPLOYEES)]: (state, { employees }) => {
      return {
        ...state,
        employees
      };
    }
  },
  initialState
);

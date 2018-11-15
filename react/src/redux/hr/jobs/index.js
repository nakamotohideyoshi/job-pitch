import { createAction, handleActions } from 'redux-actions';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const getJobsAction = createAction(C.HR_GET_JOBS);
export const saveJobAction = createAction(C.HR_SAVE_JOB);
export const removeJobAction = createAction(C.HR_REMOVE_JOB);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: null
};

export default handleActions(
  {
    // ---- get jobs ----

    [requestSuccess(C.HR_GET_JOBS)]: (state, { payload }) => ({
      ...state,
      jobs: payload
    }),

    // ---- save job ----

    [requestSuccess(C.HR_SAVE_JOB)]: (state, { payload }) => {
      return {
        ...state,
        jobs: helper.updateItem(state.jobs, payload, true)
      };
    },

    // ---- remove job ----

    [requestPending(C.HR_REMOVE_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateItem(state.jobs, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.HR_REMOVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.removeItem(state.jobs, request.id)
    }),

    [requestFail(C.HR_REMOVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.updateItem(state.jobs, {
        id: request.id,
        loading: false
      })
    }),

    // ---- log out ----

    [C.LOGOUT]: () => initialState
  },
  initialState
);

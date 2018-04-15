import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const findJobs = createAction(C.JS_FIND_JOBS);
export const applyJob = createAction(C.JS_APPLY_JOB);
export const removeJob = createAction(C.JS_REMOVE_JOB);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: null,
  error: null
};

export default handleActions(
  {
    // ---- get jobs ----

    [requestPending(C.JS_FIND_JOBS)]: state => ({
      ...state,
      jobs: null,
      error: null
    }),

    [requestSuccess(C.JS_FIND_JOBS)]: (state, { payload }) => ({
      ...state,
      jobs: payload
    }),

    [requestFail(C.JS_FIND_JOBS)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- apply job ----

    [requestPending(C.JS_APPLY_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: payload.data.job,
        loading: true
      })
    }),

    [requestSuccess(C.JS_APPLY_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: helper.removeObj(state.jobs, payload.data.job)
    }),

    [requestFail(C.JS_APPLY_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: payload.data.job,
        loading: false
      })
    }),

    // ---- remove job ----

    [C.JS_REMOVE_JOB]: (state, { payload }) => ({
      ...state,
      jobs: helper.removeObj(state.jobs, payload.id)
    })
  },
  initialState
);

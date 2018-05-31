import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';

// ------------------------------------
// Actions
// ------------------------------------

export const findJobs = createAction(C.JS_FIND_JOBS);
export const findPublicJob = createAction(C.JS_FIND_PUBLIC_JOB);
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
    // ---- find jobs ----

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

    // ---- find public jobs ----

    [requestPending(C.JS_FIND_PUBLIC_JOB)]: state => ({
      ...state,
      jobs: null,
      error: null
    }),

    [requestSuccess(C.JS_FIND_PUBLIC_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: [payload]
    }),

    [requestFail(C.JS_FIND_PUBLIC_JOB)]: (state, { payload }) => ({
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

    [requestSuccess(C.JS_APPLY_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.removeObj(state.jobs, request.data.job)
    }),

    [requestFail(C.JS_APPLY_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: request.data.job,
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

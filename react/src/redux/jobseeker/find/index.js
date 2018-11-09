import { createAction, handleActions } from 'redux-actions';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const findJobsAction = createAction(C.JS_FIND_JOBS);
export const applyJobAction = createAction(C.JS_APPLY_JOB);
export const removeJobAction = createAction(C.JS_REMOVE_JOB);
export const getPublicJobAction = createAction(C.JS_GET_PUBLIC_JOB);
export const getPublicWorkplaceAction = createAction(C.JS_GET_PUBLIC_WORKPLACE);
export const uploadSpecPitchAction = createAction(C.JS_UPLOAD_SPEC_PITCH);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: null,
  publicWorkplace: null,
  publicJob: null,
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

    // ---- apply job ----

    [C.JS_APPLY_JOB]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateItem(state.jobs, {
        id: payload.data.job,
        loading: true
      })
    }),

    [requestSuccess(C.JS_APPLY_JOB)]: (state, { job }) => ({
      ...state,
      jobs: helper.removeItem(state.jobs, job)
    }),

    [requestFail(C.JS_APPLY_JOB)]: (state, { job }) => ({
      ...state,
      jobs: helper.updateItem(state.jobs, {
        id: job,
        loading: false
      })
    }),

    // ---- remove job ----

    [C.JS_REMOVE_JOB]: (state, { payload }) => ({
      ...state,
      jobs: helper.removeItem(state.jobs, payload.id)
    }),

    // ---- get public jobs ----

    [requestPending(C.JS_GET_PUBLIC_JOB)]: state => ({
      ...state,
      publicJob: null,
      error: null
    }),

    [requestSuccess(C.JS_GET_PUBLIC_JOB)]: (state, { payload }) => ({
      ...state,
      publicJob: payload
    }),

    [requestFail(C.JS_GET_PUBLIC_JOB)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- get public workplace ----

    [requestPending(C.JS_GET_PUBLIC_WORKPLACE)]: state => ({
      ...state,
      publicWorkplace: null,
      error: null
    }),

    [requestSuccess(C.JS_GET_PUBLIC_WORKPLACE)]: (state, { payload }) => ({
      ...state,
      publicWorkplace: payload
    }),

    [requestFail(C.JS_GET_PUBLIC_WORKPLACE)]: (state, { payload }) => ({
      ...state,
      error: payload
    })
  },
  initialState
);

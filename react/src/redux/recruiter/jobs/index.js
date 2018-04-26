import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_JOBS_UPDATE);
export const getJobs = createAction(C.RC_GET_JOBS);
export const removeJob = createAction(C.RC_REMOVE_JOB);
export const saveJob = createAction(C.RC_SAVE_JOB);
export const uploadPitch = createAction(C.JS_UPLOAD_JOBPITCH);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: null
};

export default handleActions(
  {
    [C.RC_JOBS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get jobs ----

    [requestPending(C.RC_GET_JOBS)]: state => initialState,

    [requestSuccess(C.RC_GET_JOBS)]: (state, { payload }) => ({
      ...state,
      jobs: payload
    }),

    [requestFail(C.RC_GET_JOBS)]: state => ({
      ...state,
      jobs: []
    }),

    // ---- remove job ----

    [requestPending(C.RC_REMOVE_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.removeObj(state.jobs, request.id)
    }),

    [requestFail(C.RC_REMOVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: request.id,
        loading: false
      })
    }),

    // ---- save job ----

    [requestPending(C.RC_SAVE_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: payload.data.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_SAVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: request.data.id,
        loading: false
      })
    }),

    [requestFail(C.RC_SAVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, {
        id: request.data.id,
        loading: false
      })
    }),

    // ---- update job ----

    [C.RC_UPDATE_JOB]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateObj(state.jobs, payload)
    })
  },
  initialState
);

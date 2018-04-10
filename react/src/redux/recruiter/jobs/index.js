import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import _ from 'lodash';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_JOBS_UPDATE);
export const getJobs1 = createAction(C.RC_GET_JOBS1);
export const getJobs = createAction(C.RC_GET_JOBS);
export const removeJob = createAction(C.RC_REMOVE_JOB);
export const getJob = createAction(C.RC_GET_JOB);
export const saveJob = createAction(C.RC_SAVE_JOB);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs1: null,
  error1: null,

  jobs: [],
  loading: false,
  error: null,
  refreshList: true,

  job: null,
  saving: false
};

export default handleActions(
  {
    [C.RC_JOBS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get jobs ----

    [requestPending(C.RC_GET_JOBS1)]: state => ({
      ...state,
      jobs1: null,
      error1: null
    }),

    [requestSuccess(C.RC_GET_JOBS1)]: (state, { payload }) => ({
      ...state,
      jobs1: payload
    }),

    [requestFail(C.RC_GET_JOBS1)]: (state, { payload }) => ({
      ...state,
      error1: payload
    }),

    // ---- get jobs ----

    [requestPending(C.RC_GET_JOBS)]: state => ({
      ...state,
      loading: true,
      error: null
    }),

    [requestSuccess(C.RC_GET_JOBS)]: (state, { payload }) => ({
      ...state,
      jobs: payload,
      loading: false,
      refreshList: false
    }),

    [requestFail(C.RC_GET_JOBS)]: (state, { payload }) => ({
      ...state,
      jobs: [],
      loading: false,
      error: payload
    }),

    // ---- remove job ----

    [requestPending(C.RC_REMOVE_JOB)]: state => ({
      ...state,
      loading: true
    }),

    [requestSuccess(C.RC_REMOVE_JOB)]: (state, { payload }) => ({
      ...state,
      loading: false,
      jobs: helper.removeObj(state.jobs, payload.id)
    }),

    [requestFail(C.RC_REMOVE_JOB)]: state => ({
      ...state,
      loading: false
    }),

    // ---- get job ----

    [requestSuccess(C.RC_GET_JOB)]: (state, { payload }) => ({
      ...state,
      job: payload
    }),

    [requestFail(C.RC_GET_JOB)]: state => ({
      ...state,
      job: null
    }),

    // ---- save job ----

    [requestPending(C.RC_SAVE_JOB)]: state => ({
      ...state,
      saving: true
    }),

    [requestSuccess(C.RC_SAVE_JOB)]: state => ({
      ...state,
      saving: false,
      refreshList: true
    }),

    [requestFail(C.RC_SAVE_JOB)]: state => ({
      ...state,
      saving: false
    }),

    [LOCATION_CHANGE]: (state, a) => {
      const reset = a.payload.pathname.indexOf('/recruiter/jobs/job') !== 0;
      return {
        ...state,
        refreshList: reset || state.refreshList,
        jobs: reset ? [] : state.jobs
      };
    }
  },
  initialState
);

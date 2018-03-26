import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_APPS_UPDATE);

export const getJobseekers = createAction(C.RC_GET_JOBSEEKERS);
export const connectJobseeker = createAction(C.RC_CONNECT_JOBSEEKER);
export const removeJobseeker = createAction(C.RC_REMOVE_JOBSEEKER);

export const getAllJobs = createAction(C.RC_GET_ALL_JOBS);
export const getApplications = createAction(C.RC_GET_APPS);
export const updateApplication = createAction(C.RC_UPDATE_APP);
export const removeApplication = createAction(C.RC_REMOVE_APP);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: [],
  loadingJobs: false,

  jobseekers: [],
  findJobId: null,

  applications: [],
  appsJobId: null,
  loading: false,
  error: null,
  requestRefresh: true,

  currentPage: 1,
  searchText: ''
};

export default handleActions(
  {
    [C.RC_APPS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get app jobs ----

    [requestPending(C.RC_GET_ALL_JOBS)]: state => ({
      ...state,
      loadingJobs: true,
      jobs: [],
      error: null
    }),

    [requestSuccess(C.RC_GET_ALL_JOBS)]: (state, { payload }) => ({
      ...state,
      loadingJobs: false,
      jobs: payload
    }),

    [requestFail(C.RC_GET_ALL_JOBS)]: (state, { payload }) => ({
      ...state,
      loadingJobs: false,
      jobs: []
    }),

    // ---- get jobseekers ----

    [requestPending(C.RC_GET_JOBSEEKERS)]: (state, { payload }) => ({
      ...state,
      loading: true,
      findJobId: payload.jobId,
      jobseekers: state.findJobId === payload.jobId ? state.jobseekers : [],
      error: null
    }),

    [requestSuccess(C.RC_GET_JOBSEEKERS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      jobseekers: payload,
      refreshList: false
    }),

    [requestFail(C.RC_GET_JOBSEEKERS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      jobseekers: [],
      error: payload
    }),

    // ---- connect jobseeker ----

    [requestPending(C.RC_CONNECT_JOBSEEKER)]: (state, { payload }) => ({
      ...state,
      loading: true
    }),

    [requestSuccess(C.RC_CONNECT_JOBSEEKER)]: (state, { payload }) => ({
      ...state,
      loading: false
    }),

    [requestFail(C.RC_CONNECT_JOBSEEKER)]: (state, { payload }) => ({
      ...state,
      loading: false
    }),

    // ---- remove jobseeker ----

    [C.RC_REMOVE_JOBSEEKER]: (state, { payload: { id } }) => ({
      ...state,
      jobseekers: helper.removeObj(state.jobseekers, id)
    }),

    // ---- get applications ----

    [requestPending(C.RC_GET_APPS)]: state => ({
      ...state,
      loading: true,
      error: null
    }),

    [requestSuccess(C.RC_GET_APPS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      applications: payload,
      refreshList: false
    }),

    [requestFail(C.RC_GET_APPS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      applications: [],
      error: payload
    }),

    // ---- update application ----

    [requestPending(C.RC_UPDATE_APP)]: state => ({
      ...state,
      loading: true
    }),

    [requestSuccess(C.RC_UPDATE_APP)]: (state, { payload }) => ({
      ...state,
      loading: false,
      applications: helper.removeObj(state.applications, payload.id)
    }),

    [requestFail(C.RC_UPDATE_APP)]: state => ({
      ...state,
      loading: false
    }),

    // ---- change location ----

    [LOCATION_CHANGE]: (state, a) => {
      const reset = a.payload.pathname.indexOf('/recruiter/applications') !== 0;
      return {
        ...state,
        jobs: reset ? [] : state.jobs
      };
    }
  },
  initialState
);

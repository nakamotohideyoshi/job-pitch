import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import _ from 'lodash';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_APPS_UPDATE);

export const getOpenedJobs = createAction(C.RC_GET_OPENED_JOBS);

export const getJobseekers = createAction(C.RC_GET_JOBSEEKERS);
export const connectJobseeker = createAction(C.RC_CONNECT_JOBSEEKER);
export const removeJobseeker = createAction(C.RC_REMOVE_JOBSEEKER);

export const getApplications = createAction(C.RC_GET_APPS);
export const connectApplication = createAction(C.RC_CONNECT_APP);
export const updateApplication = createAction(C.RC_UPDATE_APP);
export const removeApplication = createAction(C.RC_REMOVE_APP);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: [],
  selectedJobId: null,
  loadingJobs: true,
  errorJobs: null,

  searchText: '',

  jobseekers: [],
  loadingJobseekers: true,
  errorJobseekers: null,

  applications1: null,
  loadingApplications1: true,
  errorApplications1: null,

  applications: [],
  loadingApplications: true,
  errorApplications: null
};

export default handleActions(
  {
    [C.RC_APPS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get app jobs ----

    [requestPending(C.RC_GET_OPENED_JOBS)]: state => ({
      ...state,
      jobs: [],
      loadingJobs: true,
      errorJobs: null
    }),

    [requestSuccess(C.RC_GET_OPENED_JOBS)]: (state, { payload }) => ({
      ...state,
      jobs: payload,
      loadingJobs: false
    }),

    [requestFail(C.RC_GET_OPENED_JOBS)]: (state, { payload }) => ({
      ...state,
      loadingJobs: false,
      errorJobs: payload
    }),

    // ---- get jobseekers ----

    [requestPending(C.RC_GET_JOBSEEKERS)]: (state, { payload: { clear } }) => ({
      ...state,
      jobseekers: clear ? [] : state.jobseekers,
      loadingJobseekers: true,
      errorJobseekers: null
    }),

    [requestSuccess(C.RC_GET_JOBSEEKERS)]: (state, { payload }) => ({
      ...state,
      jobseekers: payload,
      loadingJobseekers: false
    }),

    [requestFail(C.RC_GET_JOBSEEKERS)]: (state, { payload }) => ({
      ...state,
      loadingJobseekers: false,
      errorJobseekers: payload
    }),

    // ---- connect jobseeker ----

    [requestPending(C.RC_CONNECT_JOBSEEKER)]: state => ({
      ...state,
      loadingJobseekers: true
    }),

    [requestSuccess(C.RC_CONNECT_JOBSEEKER)]: (state, { payload }) => ({
      ...state,
      loadingJobseekers: false,
      jobseekers: helper.removeObj(state.jobseekers, payload.data.job_seeker)
    }),

    [requestFail(C.RC_CONNECT_JOBSEEKER)]: state => ({
      ...state,
      loadingJobseekers: false
    }),

    // ---- remove jobseeker ----

    [C.RC_REMOVE_JOBSEEKER]: (state, { payload: { id } }) => ({
      ...state,
      jobseekers: helper.removeObj(state.jobseekers, id)
    }),

    // ---- get applications ----

    // [requestPending(C.RC_GET_APPS1)]: state => ({
    //   ...state,
    //   applications1: null,
    //   loadingApplications1: true,
    //   errorApplications1: null
    // }),

    // [requestSuccess(C.RC_GET_APPS1)]: (state, { payload }) => ({
    //   ...state,
    //   applications1: payload,
    //   loadingApplications1: false
    // }),

    // [requestFail(C.RC_GET_APPS1)]: (state, { payload }) => ({
    //   ...state,
    //   loadingApplications1: false,
    //   errorApplications1: payload
    // }),

    [requestPending(C.RC_GET_APPS)]: (state, { payload: { clear } }) => ({
      ...state,
      applications: clear ? [] : state.applications,
      loadingApplications: true,
      errorApplications: null
    }),

    [requestSuccess(C.RC_GET_APPS)]: (state, { payload }) => ({
      ...state,
      applications: payload,
      loadingApplications: false
    }),

    [requestFail(C.RC_GET_APPS)]: (state, { payload }) => ({
      ...state,
      loadingApplications: false,
      errorApplications: payload
    }),

    // ---- update application ----

    [requestPending(C.RC_UPDATE_APP)]: state => ({
      ...state,
      loadingApplications: true
    }),

    [requestSuccess(C.RC_UPDATE_APP)]: state => ({
      ...state,
      loadingApplications: false
    }),

    [requestFail(C.RC_UPDATE_APP)]: state => ({
      ...state,
      loadingApplicationss: false
    }),

    // ---- remove application ----

    [requestPending(C.RC_REMOVE_APP)]: state => ({
      ...state,
      loadingApplications: true
    }),

    [requestSuccess(C.RC_REMOVE_APP)]: (state, { payload: { id } }) => ({
      ...state,
      loadingApplications: false,
      applications: helper.removeObj(state.applications, id)
    }),

    [requestFail(C.RC_REMOVE_APP)]: state => ({
      ...state,
      loadingApplicationss: false
    }),

    // ---- change location ----

    [LOCATION_CHANGE]: (state, { payload: { pathname } }) => {
      if (pathname.indexOf('/auth') === 0) {
        return initialState;
      }

      const key = pathname.split('/')[2];
      const reset = pathname.indexOf('/recruiter/messages') !== 0;
      return {
        ...state,
        jobs: key === 'applications' ? state.jobs : []
      };
    }
  },

  initialState
);

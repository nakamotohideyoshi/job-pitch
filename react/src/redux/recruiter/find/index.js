import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';

// ------------------------------------
// Actions
// ------------------------------------

export const findJobseekers = createAction(C.RC_FIND_JOBSEEKERS);
export const connectJobseeker = createAction(C.RC_CONNECT_JOBSEEKER);
export const removeJobseeker = createAction(C.RC_REMOVE_JOBSEEKER);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobseekers: null,
  error: null
};

export default handleActions(
  {
    // ---- find jobseekers ----

    [requestPending(C.RC_FIND_JOBSEEKERS)]: state => ({
      ...state,
      jobseekers: null,
      error: null
    }),

    [requestSuccess(C.RC_FIND_JOBSEEKERS)]: (state, { payload }) => ({
      ...state,
      jobseekers: payload
    }),

    [requestFail(C.RC_FIND_JOBSEEKERS)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- connect jobseeker ----

    [C.RC_CONNECT_JOBSEEKER]: (state, { payload }) => ({
      ...state,
      jobseekers: helper.updateObj(state.jobseekers, {
        id: payload.data.job_seeker,
        loading: true
      })
    }),

    [requestPending(C.RC_CONNECT_JOBSEEKER)]: (state, { payload }) => ({
      ...state,
      jobseekers: helper.updateObj(state.jobseekers, {
        id: payload.data.job_seeker,
        loading: true
      })
    }),

    [requestSuccess(C.RC_CONNECT_JOBSEEKER)]: (state, { request }) => ({
      ...state,
      jobseekers: helper.removeObj(state.jobseekers, request.data.job_seeker)
    }),

    [requestFail(C.RC_CONNECT_JOBSEEKER)]: (state, { request }) => ({
      ...state,
      jobseekers: helper.updateObj(state.jobseekers, {
        id: request.data.job_seeker,
        loading: false
      })
    }),

    // ---- remove jobseeker ----

    [C.RC_REMOVE_JOBSEEKER]: (state, { payload }) => ({
      ...state,
      jobseekers: helper.removeObj(state.jobseekers, payload.id)
    }),

    // ---- change location ----

    [LOCATION_CHANGE]: (state, { payload }) => {
      const clear = payload.pathname.indexOf('/recruiter/applications') !== 0;
      return {
        ...state,
        jobseekers: clear ? null : state.jobseekers
      };
    }
  },
  initialState
);

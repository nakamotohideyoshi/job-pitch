import { createAction, handleActions } from 'redux-actions';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const findJobseekersAction = createAction(C.RC_FIND_JOBSEEKERS);
export const connectJobseekerAction = createAction(C.RC_CONNECT_JOBSEEKER);
export const removeJobseekerAction = createAction(C.RC_REMOVE_JOBSEEKER);

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

    [requestPending(C.RC_FIND_JOBSEEKERS)]: state => initialState,

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
      jobseekers: helper.updateItem(state.jobseekers, {
        id: payload.data.job_seeker,
        loading: true
      })
    }),

    [requestSuccess(C.RC_CONNECT_JOBSEEKER)]: (state, { job_seeker }) => ({
      ...state,
      jobseekers: helper.removeItem(state.jobseekers, job_seeker)
    }),

    [requestFail(C.RC_CONNECT_JOBSEEKER)]: (state, { job_seeker }) => ({
      ...state,
      jobseekers: helper.updateItem(state.jobseekers, {
        id: job_seeker,
        loading: false
      })
    }),

    // ---- remove jobseeker ----

    [C.RC_REMOVE_JOBSEEKER]: (state, { payload }) => ({
      ...state,
      jobseekers: helper.updateItem(state.jobseekers, {
        id: payload.data.job_seeker,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_JOBSEEKER)]: (state, { request }) => ({
      ...state,
      jobseekers: helper.removeItem(state.jobseekers, request.data.job_seeker)
    }),

    [requestFail(C.RC_REMOVE_JOBSEEKER)]: (state, { request }) => ({
      ...state,
      jobseekers: helper.updateItem(state.jobseekers, {
        id: request.data.job_seeker,
        loading: false
      })
    })
  },
  initialState
);

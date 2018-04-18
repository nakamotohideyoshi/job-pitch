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
      jobseekers: null
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

    [requestPending(C.RC_CONNECT_JOBSEEKER)]: (state, { payload }) => ({
      ...state,
      jobseekers: helper.updateObj(state.jobseekers, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_CONNECT_JOBSEEKER)]: (state, { request }) => ({
      ...state,
      jobseekers: helper.removeObj(state.jobseekers, request.id)
    }),

    [requestFail(C.RC_CONNECT_JOBSEEKER)]: (state, { request }) => ({
      ...state,
      jobseekers: helper.updateObj(state.jobseekers, {
        id: request.id,
        loading: false
      })
    }),

    // ---- remove jobseeker ----

    [C.RC_REMOVE_JOBSEEKER]: (state, { payload: { id } }) => ({
      ...state,
      jobseekers: helper.removeObj(state.jobseekers, id)
    })
  },
  initialState
);

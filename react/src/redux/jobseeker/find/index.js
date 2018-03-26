import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.JS_FIND_UPDATE);
export const getJobs = createAction(C.JS_GET_JOBS);
export const applyJob = createAction(C.JS_APPLY_JOB);
export const removeJob = createAction(C.JS_REMOVE_JOB);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: [],
  error: null,
  loading: false,
  loadingItem: null,
  requestRefresh: true,
  currentPage: 1,
  searchText: ''
};

export default handleActions(
  {
    [C.JS_FIND_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get jobs ----

    [requestPending(C.JS_GET_JOBS)]: state => ({
      ...state,
      loading: true,
      error: null
    }),

    [requestSuccess(C.JS_GET_JOBS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      jobs: payload,
      requestRefresh: false
    }),

    [requestFail(C.JS_GET_JOBS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      jobs: [],
      error: payload
    }),

    // ---- apply job ----

    [requestPending(C.JS_APPLY_JOB)]: (state, { payload }) => ({
      ...state,
      loadingItem: payload.data.job
    }),

    [requestSuccess(C.JS_APPLY_JOB)]: (state, { payload }) => ({
      ...state,
      loadingItem: null,
      jobs: helper.removeObj(state.jobs, state.loadingItem)
    }),

    [requestFail(C.JS_APPLY_JOB)]: (state, { payload }) => ({
      ...state,
      loadingItem: null
    }),

    // ---- remove job ----

    [C.JS_REMOVE_JOB]: (state, { payload }) => ({
      ...state,
      jobs: helper.removeObj(state.jobs, payload)
    }),

    [LOCATION_CHANGE]: (state, { payload }) => {
      if (payload.pathname.indexOf('/jobseeker/find') === 0) {
        return state;
      }
      return {
        ...state,
        requestRefresh: true,
        currentPage: 1,
        searchText: ''
      };
    }
  },
  initialState
);

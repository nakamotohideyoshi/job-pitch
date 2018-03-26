import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.JS_APPS_UPDATE);
export const getApplications = createAction(C.JS_GET_APPS);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  applications: [],
  error: null,
  currentPage: 1,
  searchText: '',
  loading: false,
  requestRefresh: true
};

export default handleActions(
  {
    [C.JS_APPS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    [requestPending(C.JS_GET_APPS)]: state => ({
      ...state,
      loading: true,
      error: null
    }),

    [requestSuccess(C.JS_GET_APPS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      applications: payload,
      requestRefresh: false
    }),

    [requestFail(C.JS_GET_APPS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      applications: [],
      error: payload
    }),

    [LOCATION_CHANGE]: (state, { payload }) => {
      if (payload.pathname.indexOf('/jobseeker/applications') === 0) {
        return state;
      }
      return {
        ...state,
        currentPage: 1,
        searchText: '',
        requestRefresh: true
      };
    }
  },
  initialState
);

import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_BUSINESSES_UPDATE);
export const getBusinesses = createAction(C.RC_GET_BUSINESSES);
export const removeBusiness = createAction(C.RC_REMOVE_BUSINESS);
export const selectBusiness = createAction(C.RC_SELECT_BUSINESS);
export const saveBusiness = createAction(C.RC_SAVE_BUSINESS);
export const purchase = createAction(C.RC_PURCHASE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  businesses: [],
  loading: false,
  error: null,
  refreshList: true,

  business: null,
  saving: false,

  credits: 0
};

export default handleActions(
  {
    [C.RC_BUSINESSES_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get business ----

    [requestPending(C.RC_GET_BUSINESSES)]: state => ({
      ...state,
      loading: true,
      error: null
    }),

    [requestSuccess(C.RC_GET_BUSINESSES)]: (state, { payload }) => ({
      ...state,
      businesses: payload,
      loading: false,
      refreshList: false
    }),

    [requestFail(C.RC_GET_BUSINESSES)]: (state, { payload }) => ({
      ...state,
      businesses: [],
      loading: false,
      error: payload
    }),

    // ---- remove business ----

    [requestPending(C.RC_REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      loading: true
    }),

    [requestSuccess(C.RC_REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      businesses: helper.removeObj(state.businesses, payload.id)
    }),

    [requestFail(C.RC_REMOVE_BUSINESS)]: state => ({
      ...state,
      loading: false
    }),

    // ---- select business ----

    [requestSuccess(C.RC_SELECT_BUSINESS)]: (state, { payload }) => ({
      ...state,
      business: payload
    }),

    [requestFail(C.RC_SELECT_BUSINESS)]: state => ({
      ...state,
      business: null
    }),

    // ---- save business ----

    [requestPending(C.RC_SAVE_BUSINESS)]: state => ({
      ...state,
      saving: true
    }),

    [requestSuccess(C.RC_SAVE_BUSINESS)]: state => ({
      ...state,
      saving: false,
      refreshList: true
    }),

    [requestFail(C.RC_SAVE_BUSINESS)]: state => ({
      ...state,
      saving: false
    }),

    [LOCATION_CHANGE]: (state, { payload: { pathname } }) => {
      const key = pathname.split('/')[2];
      const reset = pathname.indexOf('/recruiter/jobs/business') !== 0;
      // const credits = pathname.indexOf('/recruiter/settings/credits') === 0 ? state.credits : 0;
      return {
        ...state,
        refreshList: reset || state.refreshList,
        workplaces: reset ? [] : state.businesses,
        business: key === 'applications' || key === 'jobs' ? state.business : []
      };
    }
  },
  initialState
);

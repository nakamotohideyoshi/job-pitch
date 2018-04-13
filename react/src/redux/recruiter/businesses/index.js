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
  businesses: null,
  error: null,

  selectedId: null,
  saving: false,
  saveError: null,

  credits: 0
};

export default handleActions(
  {
    [C.RC_BUSINESSES_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get business ----

    [requestPending(C.RC_GET_BUSINESSES)]: state => initialState,

    [requestSuccess(C.RC_GET_BUSINESSES)]: (state, { payload }) => ({
      ...state,
      businesses: payload
    }),

    [requestFail(C.RC_GET_BUSINESSES)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- remove business ----

    [requestPending(C.RC_REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      businesses: helper.updateObj(state.businesses, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      loading: false,
      businesses: helper.removeObj(state.businesses, payload.id)
    }),

    [requestFail(C.RC_REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      businesses: helper.updateObj(state.businesses, {
        id: payload.data.job,
        loading: false
      })
    }),

    // ---- save business ----

    [requestPending(C.RC_SAVE_BUSINESS)]: state => ({
      ...state,
      saving: true,
      saveError: null
    }),

    [requestSuccess(C.RC_SAVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      saving: false
    }),

    [requestFail(C.RC_SAVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      saving: false,
      saveError: payload
    })
  },
  initialState
);

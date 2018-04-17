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
export const saveBusiness = createAction(C.RC_SAVE_BUSINESS);
export const selectBusiness = createAction(C.RC_SELECT_BUSINESS);
export const purchase = createAction(C.RC_PURCHASE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  businesses: null,
  selectedId: null
};

export default handleActions(
  {
    [C.RC_BUSINESSES_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    [C.RC_SELECT_BUSINESS]: (state, { payload }) => ({
      ...state,
      selectedId: payload
    }),

    // ---- get business ----

    [requestPending(C.RC_GET_BUSINESSES)]: state => initialState,

    [requestSuccess(C.RC_GET_BUSINESSES)]: (state, { payload }) => ({
      ...state,
      businesses: payload
    }),

    [requestFail(C.RC_GET_BUSINESSES)]: state => ({
      ...state,
      businesses: []
    }),

    // ---- remove business ----

    [requestPending(C.RC_REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      businesses: helper.updateObj(state.businesses, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_BUSINESS)]: (state, { request }) => ({
      ...state,
      businesses: helper.removeObj(state.businesses, request.id)
    }),

    [requestFail(C.RC_REMOVE_BUSINESS)]: (state, { request }) => ({
      ...state,
      businesses: helper.updateObj(state.businesses, {
        id: request.id,
        loading: false
      })
    })
  },
  initialState
);

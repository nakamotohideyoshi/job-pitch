import { createAction, handleActions } from 'redux-actions';
import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

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
    [C.RC_SELECT_BUSINESS]: (state, { payload }) => ({
      ...state,
      selectedId: payload
    }),

    // ---- get businesses ----

    [requestSuccess(C.RC_GET_BUSINESSES)]: (state, { payload }) => ({
      ...state,
      businesses: payload
    }),

    // ---- update business ----

    [C.RC_UPDATE_BUSINESS]: (state, { business }) => ({
      ...state,
      businesses: helper.updateItem(state.businesses, business, true)
    }),

    // ---- remove business ----

    [requestPending(C.RC_REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      businesses: helper.updateItem(state.businesses, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_BUSINESS)]: (state, { request }) => ({
      ...state,
      businesses: helper.removeItem(state.businesses, request.id)
    }),

    [requestFail(C.RC_REMOVE_BUSINESS)]: (state, { request }) => ({
      ...state,
      businesses: helper.updateItem(state.businesses, {
        id: request.id,
        loading: false
      })
    }),

    [LOCATION_CHANGE]: (state, { payload }) => ({
      ...state,
      selectedId: null
    }),

    [C.LOGOUT]: () => initialState
  },
  initialState
);

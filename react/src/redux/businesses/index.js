import { createAction, handleActions } from 'redux-actions';
import { LOCATION_CHANGE } from 'react-router-redux';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const removeBusinessAction = createAction(C.REMOVE_BUSINESS);
export const saveBusinessAction = createAction(C.SAVE_BUSINESS);
export const selectBusinessAction = createAction(C.SELECT_BUSINESS);
export const purchaseAction = createAction(C.PURCHASE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  businesses: [],
  selectedId: null
};

export default handleActions(
  {
    [C.SELECT_BUSINESS]: (state, { payload }) => ({
      ...state,
      selectedId: payload
    }),

    // ---- get businesses ----

    [requestSuccess(C.GET_BUSINESSES)]: (state, { payload }) => ({
      ...state,
      businesses: payload
    }),

    // ---- update business ----

    [C.UPDATE_BUSINESS]: (state, { payload }) => ({
      ...state,
      businesses: helper.updateItem(state.businesses, payload, true)
    }),

    // ---- remove business ----

    [requestPending(C.REMOVE_BUSINESS)]: (state, { payload }) => ({
      ...state,
      businesses: helper.updateItem(state.businesses, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.REMOVE_BUSINESS)]: (state, { request }) => ({
      ...state,
      businesses: helper.removeItem(state.businesses, request.id)
    }),

    [requestFail(C.REMOVE_BUSINESS)]: (state, { request }) => ({
      ...state,
      businesses: helper.updateItem(state.businesses, {
        id: request.id,
        loading: false
      })
    }),

    [LOCATION_CHANGE]: state => ({
      ...state,
      selectedId: null
    }),

    [C.LOGOUT]: () => initialState
  },
  initialState
);

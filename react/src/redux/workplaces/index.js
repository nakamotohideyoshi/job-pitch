import { createAction, handleActions } from 'redux-actions';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const removeWorkplaceAction = createAction(C.REMOVE_WORKPLACE);
export const saveWorkplaceAction = createAction(C.SAVE_WORKPLACE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  workplaces: []
};

export default handleActions(
  {
    // ---- get workplaces ----

    [requestSuccess(C.GET_WORKPLACES)]: (state, { payload }) => ({
      ...state,
      workplaces: payload
    }),

    // ---- update workplace ----

    [C.UPDATE_WORKPLACE]: (state, { payload }) => ({
      ...state,
      workplaces: helper.updateItem(state.workplaces, payload, true)
    }),

    // ---- remove workplace ----

    [requestPending(C.REMOVE_WORKPLACE)]: (state, { payload }) => ({
      ...state,
      workplaces: helper.updateItem(state.workplaces, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.REMOVE_WORKPLACE)]: (state, { request }) => ({
      ...state,
      workplaces: helper.removeItem(state.workplaces, request.id)
    }),

    [requestFail(C.REMOVE_WORKPLACE)]: (state, { request }) => ({
      ...state,
      workplaces: helper.updateItem(state.workplaces, {
        id: request.id,
        loading: false
      })
    }),

    [C.LOGOUT]: () => initialState
  },
  initialState
);

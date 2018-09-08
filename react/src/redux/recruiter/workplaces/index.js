import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const removeWorkplace = createAction(C.RC_REMOVE_WORKPLACE);
export const saveWorkplace = createAction(C.RC_SAVE_WORKPLACE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  workplaces: null
};

export default handleActions(
  {
    // ---- get workplaces ----

    [requestSuccess(C.RC_GET_WORKPLACES)]: (state, { payload }) => ({
      ...state,
      workplaces: payload
    }),

    // ---- update workplace ----

    [C.RC_UPDATE_WORKPLACE]: (state, { workplace }) => ({
      ...state,
      workplaces: helper.updateItem(state.workplaces, workplace, true)
    }),

    // ---- remove workplace ----

    [requestPending(C.RC_REMOVE_WORKPLACE)]: (state, { payload }) => ({
      ...state,
      workplaces: helper.updateItem(state.workplaces, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_WORKPLACE)]: (state, { request }) => ({
      ...state,
      workplaces: helper.removeItem(state.workplaces, request.id)
    }),

    [requestFail(C.RC_REMOVE_WORKPLACE)]: (state, { request }) => ({
      ...state,
      workplaces: helper.updateItem(state.workplaces, {
        id: request.id,
        loading: false
      })
    })
  },
  initialState
);

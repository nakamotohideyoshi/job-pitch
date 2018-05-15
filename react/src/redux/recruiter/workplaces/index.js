import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_WORKPLACES_UPDATE);
export const getWorkplaces = createAction(C.RC_GET_WORKPLACES);
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
    [C.RC_WORKPLACES_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get workplace ----

    [requestPending(C.RC_GET_WORKPLACES)]: state => initialState,

    [requestSuccess(C.RC_GET_WORKPLACES)]: (state, { payload }) => ({
      ...state,
      workplaces: payload
    }),

    [requestFail(C.RC_GET_WORKPLACES)]: state => ({
      ...state,
      workplaces: []
    }),

    // ---- remove workplace ----

    [requestPending(C.RC_REMOVE_WORKPLACE)]: (state, { payload }) => ({
      ...state,
      workplaces: helper.updateObj(state.workplaces, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_WORKPLACE)]: (state, { request }) => ({
      ...state,
      workplaces: helper.removeObj(state.workplaces, request.id)
    }),

    [requestFail(C.RC_REMOVE_WORKPLACE)]: (state, { request }) => ({
      ...state,
      workplaces: helper.updateObj(state.workplaces, {
        id: request.id,
        loading: false
      })
    })
  },
  initialState
);

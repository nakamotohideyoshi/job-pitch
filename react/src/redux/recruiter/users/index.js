import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';

// ------------------------------------
// Actions
// ------------------------------------

export const getUsers = createAction(C.RC_GET_USERS);
export const saveUser = createAction(C.RC_SAVE_USER);
export const resendInvitation = createAction(C.RC_RESEND_INVITATION);
export const removeUser = createAction(C.RC_REMOVE_USER);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  users: null,
  error: null
};

export default handleActions(
  {
    // ---- get users ----

    [requestPending(C.RC_GET_USERS)]: () => initialState,

    [requestSuccess(C.RC_GET_USERS)]: (state, { payload }) => ({
      ...state,
      users: payload
    }),

    [requestFail(C.RC_GET_USERS)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- remove user ----

    [requestPending(C.RC_REMOVE_USER)]: (state, { payload }) => ({
      ...state,
      users: helper.updateItem(state.users, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_USER)]: (state, { request }) => ({
      ...state,
      users: helper.removeItem(state.users, request.id)
    }),

    [requestFail(C.RC_REMOVE_USER)]: (state, { request }) => ({
      ...state,
      users: helper.updateItem(state.users, {
        id: request.id,
        loading: false
      })
    })
  },
  initialState
);

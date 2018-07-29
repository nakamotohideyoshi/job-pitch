import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_USERS_UPDATE);
export const getUsers = createAction(C.RC_GET_USERS);
export const removeUser = createAction(C.RC_REMOVE_USER);
export const saveUser = createAction(C.RC_SAVE_USER);
export const resendInvitation = createAction(C.RC_RESEND_INVITATION);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  users: null
};

export default handleActions(
  {
    [C.RC_USERS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get users ----

    [requestPending(C.RC_GET_USERS)]: state => initialState,

    [requestSuccess(C.RC_GET_USERS)]: (state, { payload }) => ({
      ...state,
      users: payload
    }),

    [requestFail(C.RC_GET_USERS)]: state => ({
      ...state,
      users: []
    }),

    // ---- remove user ----

    [requestPending(C.RC_REMOVE_USER)]: (state, { payload }) => ({
      ...state,
      users: helper.updateObj(state.users, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_USER)]: (state, { request }) => ({
      ...state,
      users: helper.removeObj(state.users, request.id)
    }),

    [requestFail(C.RC_REMOVE_USER)]: (state, { request }) => ({
      ...state,
      users: helper.updateObj(state.users, {
        id: request.id,
        loading: false
      })
    }),

    // ---- save user ----

    [requestPending(C.RC_SAVE_USER)]: (state, { payload }) => ({
      ...state,
      users: helper.updateObj(state.users, {
        id: payload.data.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_SAVE_USER)]: (state, { request }) => ({
      ...state,
      users: helper.updateObj(state.users, {
        id: request.data.id,
        loading: false
      })
    }),

    [requestFail(C.RC_SAVE_USER)]: (state, { request }) => ({
      ...state,
      users: helper.updateObj(state.users, {
        id: request.data.id,
        loading: false
      })
    }),

    // ---- update user ----

    [C.RC_UPDATE_USER]: (state, { payload }) => ({
      ...state,
      users: helper.updateObj(state.users, payload)
    })
  },
  initialState
);

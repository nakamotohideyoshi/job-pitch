import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const register = createAction(C.REGISTER);
export const login = createAction(C.LOGIN);
export const logout = createAction(C.LOGOUT);
export const resetPassword = createAction(C.RESET_PASSWORD);
export const changePassword = createAction(C.CHANGE_PASSWORD);

export const getUserData = createAction(C.GET_USERDATA);
export const updateAuth = createAction(C.UPDATE_AUTH);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  status: 'auth',
  user: null
};

export default handleActions(
  {
    [C.UPDATE_AUTH]: (state, { payload }) => {
      if (payload.status) {
        localStorage.setItem('status', payload.status);
      }
      return {
        ...state,
        ...payload
      };
    },

    [LOCATION_CHANGE]: state => ({
      ...state,
      status: localStorage.getItem('status') || 'auth'
    }),

    [C.LOGOUT]: () => {
      localStorage.removeItem('status');
      return initialState;
    }
  },
  initialState
);

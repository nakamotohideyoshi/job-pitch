import { createAction, handleActions } from 'redux-actions';

import DATA from 'utils/data';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const registerAction = createAction(C.REGISTER);
export const loginAction = createAction(C.LOGIN);
export const logoutAction = createAction(C.LOGOUT);
export const resetPasswordAction = createAction(C.RESET_PASSWORD);
export const changePasswordAction = createAction(C.CHANGE_PASSWORD);

export const updateAuthAction = createAction(C.UPDATE_AUTH);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  user: null,
  jobseeker: null,
  jobprofile: null
};

export default handleActions(
  {
    [C.UPDATE_AUTH]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    [C.LOGOUT]: () => {
      DATA.userKey = undefined;
      DATA.email = undefined;
      DATA.userRole = undefined;
      return {
        ...initialState
      };
    }
  },
  initialState
);

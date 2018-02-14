import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from './constants';

const initialState = {
  permission: 0
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case C.REGISTER:
    case C.LOGIN:
      return {
        ...state,
        loading: true,
        errors: null
      };
    case C.LOGIN_SUCCESS:
      return {
        ...state,
        loginState: action.loginState,
        permission: action.permission,
        loading: false
      };
    case C.LOGIN_ERROR:
      return {
        ...state,
        loading: false,
        errors: action.errors
      };

    /* logout */

    case C.LOGOUT:
      return {
        ...state,
        loginState: 'none',
        permission: 0
      };

    /* select usertype */

    case C.SELECT_USERTYPE:
      return {
        ...state,
        loginState: action.usertype
      };

    case C.UPDATE_INFO:
      return {
        ...state,
        permission: action.permission || state.permission
      };

    /**
    |--------------------------------------------------
    | LOCATION_CHANGE
    |--------------------------------------------------
    */

    case LOCATION_CHANGE:
      return {
        ...state,
        loading: false,
        errors: null
      };

    default:
      return state;
  }
}

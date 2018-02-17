import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from './constants';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case C.RESET_PASSWORD:
      return {
        ...state,
        loading: true,
        success: null,
        errors: null
      };
    case C.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.success
      };
    case C.RESET_PASSWORD_ERROR:
      return {
        ...state,
        loading: false,
        errors: action.errors
      };

    case LOCATION_CHANGE:
      return {};

    default:
      return state;
  }
}
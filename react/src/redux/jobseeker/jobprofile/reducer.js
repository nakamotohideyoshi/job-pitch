import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from './constants';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case C.JS_JOBPROFILE_LOAD_SUCESS:
      return {
        ...state,
        profile: action.profile
      };
    case C.JS_JOBPROFILE_LOAD_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    case C.JS_JOBPROFILE_SAVE:
      return {
        ...state,
        saving: true,
        errors: null
      };
    case C.JS_JOBPROFILE_SAVE_SUCCESS:
      return {
        ...state,
        saving: false,
        profile: action.profile
      };
    case C.JS_JOBPROFILE_SAVE_ERROR:
      return {
        ...state,
        saving: false,
        errors: action.errors
      };

    case LOCATION_CHANGE:
      return {};
    default:
      return state;
  }
}

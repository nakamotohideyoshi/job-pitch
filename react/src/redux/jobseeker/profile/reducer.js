import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from './constants';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    // load profile
    case C.JS_PROFILE_LOAD:
      return {
        ...state,
        jobseeker: null
      };
    case C.JS_PROFILE_LOAD_SUCESS:
      return {
        ...state,
        jobseeker: action.jobseeker
      };
    case C.JS_PROFILE_LOAD_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // save profile
    case C.JS_PROFILE_SAVE:
    case C.JS_PITCH_UPLOAD:
      return {
        ...state,
        saving: true,
        errors: null
      };
    case C.JS_PROFILE_SAVE_SUCCESS:
      return {
        ...state,
        saving: false,
        jobseeker: action.jobseeker
      };
    case C.JS_PROFILE_SAVE_ERROR:
      return {
        ...state,
        saving: false,
        errors: action.errors
      };

    default:
      return state;
  }
}

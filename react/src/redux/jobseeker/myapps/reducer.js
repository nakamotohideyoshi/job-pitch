import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from './constants';

const initialState = {
  applications: null,
  errors: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case C.JS_GET_APPLICATIONS_SUCCESS:
      return {
        ...state,
        applications: action.applications
      };
    case C.JS_GET_APPLICATIONS_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    /**
    |--------------------------------------------------
    | LOCATION_CHANGE
    |--------------------------------------------------
    */

    case LOCATION_CHANGE:
      return initialState;

    default:
      return state;
  }
}

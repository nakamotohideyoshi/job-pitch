// import { LOCATION_CHANGE } from 'react-router-redux';
import { cloneObj, removeObj } from 'utils/helper';
import * as C from './constants';

const initialState = {
  jobseeker: null,
  application: null,
  errors: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case C.RC_GET_JOBSEEKER:
      return initialState;

    case C.RC_GET_JOBSEEKER_SUCCESS:
      return {
        ...state,
        jobseeker: action.jobseeker,
        application: action.application
      };

      case C.RC_GET_JOBSEEKER_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    default:
      return state;
  }
}

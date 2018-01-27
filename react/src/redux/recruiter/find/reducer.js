// import { LOCATION_CHANGE } from 'react-router-redux';
import { cloneObj, removeObj } from 'utils/helper';
import * as C from './constants';

const initialState = {
  jobseekers: null,
  selectedJobseeker: null,
  error: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // get jobseekers
    case C.RC_GET_JOBSEEKERS:
      return initialState;

    case C.RC_GET_JOBSEEKERS_SUCCESS:
      return {
        ...state,
        jobseekers: action.jobseekers
      };

    // select jobseeker
    case C.RC_SELECT_JOBSEEKER:
      return {
        ...state,
        selectedJobseeker: action.jobseeker
      };

    // connec, remove jobseeker
    case C.RC_CONNECT_JOBSEEKER:
      return {
        ...state,
        jobseekers: cloneObj(state.jobseekers, {
          id: action.jobseekerId,
          loading: true
        })
      };
    case C.RC_REMOVE_JOBSEEKER:
    case C.RC_CONNECT_JOBSEEKER_SUCCESS:
      return {
        ...state,
        jobseekers: removeObj(state.jobseekers, action.jobseekerId)
      };
    case C.RC_CONNECT_JOBSEEKER_ERROR:
      return {
        ...state,
        jobseekers: cloneObj(state.jobseekers, {
          id: action.jobseekerId,
          loading: false
        })
      };

    default:
      return state;
  }
}

// import { LOCATION_CHANGE } from 'react-router-redux';
import { cloneObj, removeObj } from 'utils/helper';
import * as C from './constants';

const initialState = {
  jobseeker: null,
  profile: null,
  jobs: null,
  errors: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // get jobs
    case C.JS_GET_JOBS:
      return initialState;

    case C.JS_GET_JOBS_SUCCESS:
      return {
        ...state,
        jobseeker: action.jobseeker,
        profile: action.profile,
        jobs: action.jobs
      };
    case C.JS_GET_JOBS_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // apply, remove job
    case C.JS_APPLY_JOB:
      return {
        ...state,
        jobs: cloneObj(state.jobs, {
          id: action.jobId,
          loading: true
        })
      };
    case C.JS_REMOVE_JOB:
    case C.JS_APPLY_JOB_SUCCESS:
      return {
        ...state,
        jobs: removeObj(state.jobs, action.jobId)
      };
    case C.JS_APPLY_JOB_ERROR:
      return {
        ...state,
        jobs: cloneObj(state.jobs, {
          id: action.jobId,
          loading: false
        })
      };

    default:
      return state;
  }
}

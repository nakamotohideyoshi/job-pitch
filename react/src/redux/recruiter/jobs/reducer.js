import { LOCATION_CHANGE } from 'react-router-redux';
import { cloneObj, removeObj } from 'utils/helper';
import * as C from './constants';

const initialState = {
  jobs: null,
  selectedJob: null,
  errors: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // load
    case C.RC_GET_JOBS:
      return initialState;

    case C.RC_GET_JOBS_SUCCESS:
      return {
        ...state,
        jobs: action.jobs
      };

    case C.RC_GET_JOBS_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // remove
    case C.RC_JOB_REMOVE:
      return {
        ...state,
        jobs: cloneObj(state.jobs, {
          id: action.jobId,
          deleting: true
        }),
        selectedJob: cloneObj(state.selectedJob, {
          deleting: true
        })
      };
    case C.RC_JOB_REMOVE_SUCCESS:
      return {
        ...state,
        jobs: removeObj(state.jobs, action.jobId),
        selectedJob: null
      };
    case C.RC_JOB_REMOVE_ERROR:
      return {
        ...state,
        jobs: cloneObj(state.jobs, {
          id: action.jobId,
          deleting: false
        }),
        selectedJob: cloneObj(state.selectedJob, {
          deleting: false
        })
      };

    // update
    case C.RC_JOB_UPDATE:
      return {
        ...state,
        jobs: cloneObj(state.jobs, {
          id: action.model.id,
          updating: true
        }),
        selectedJob: cloneObj(state.selectedJob, {
          updating: true
        })
      };
    case C.RC_JOB_UPDATE_SUCCESS:
      return {
        ...state,
        jobs: cloneObj(state.jobs, action.job),
        selectedJob: state.selectedJob && action.job
      };
    case C.RC_JOB_UPDATE_ERROR:
      return {
        ...state,
        jobs: cloneObj(state.jobs, {
          id: action.jobId,
          updating: false
        }),
        selectedJob: cloneObj(state.selectedJob, {
          updating: false
        })
      };

    // load
    case C.RC_JOB_GET_SUCCESS:
      return {
        ...state,
        selectedJob: action.job
      };
    case C.RC_JOB_GET_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // save
    case C.RC_JOB_SAVE:
      return {
        ...state,
        selectedJob: cloneObj(state.selectedJob, {
          saving: true
        }),
        errors: null
      };
    case C.RC_JOB_SELECT:
    case C.RC_JOB_SAVE_SUCCESS:
      return {
        ...state,
        selectedJob: action.job
      };
    case C.RC_JOB_SAVE_ERROR:
      return {
        ...state,
        selectedJob: cloneObj(state.selectedJob, {
          saving: false
        }),
        errors: action.errors
      };

    default:
      return state;
  }
}

import _ from 'lodash';

const GET_BUSINESSES = 'mjp/jobmanager/GET_BUSINESSES';
const GET_BUSINESSES_SUCCESS = 'mjp/jobmanager/GET_BUSINESSES_SUCCESS';
const GET_BUSINESSES_FAIL = 'mjp/jobmanager/GET_BUSINESSES_FAIL';
const SAVE_BUSINESS = 'mjp/jobmanager/SAVE_BUSINESS';
const SAVE_BUSINESS_RESPONSE = 'mjp/jobmanager/SAVE_BUSINESS_RESPONSE';
const SELECT_BUSINESS = 'mjp/jobmanager/SELECT_BUSINESS';

const GET_WORKPLACES = 'mjp/jobmanager/GET_WORKPLACES';
const GET_WORKPLACES_SUCCESS = 'mjp/jobmanager/GET_WORKPLACES_SUCCESS';
const GET_WORKPLACES_FAIL = 'mjp/jobmanager/GET_WORKPLACES_FAIL';
const SAVE_WORKPLACE = 'mjp/jobmanager/SAVE_WORKPLACE';
const SAVE_WORKPLACE_RESPONSE = 'mjp/jobmanager/SAVE_WORKPLACE_RESPONSE';
const SELECT_WORKPLACE = 'mjp/jobmanager/SELECT_WORKPLACE';

const GET_JOBS = 'mjp/jobmanager/GET_JOBS';
const GET_JOBS_SUCCESS = 'mjp/jobmanager/GET_JOBS_SUCCESS';
const GET_JOBS_FAIL = 'mjp/jobmanager/GET_JOBS_FAIL';
const SAVE_JOB = 'mjp/jobmanager/SAVE_JOB';
const SAVE_JOB_RESPONSE = 'mjp/jobmanager/SAVE_JOB_RESPONSE';
const SELECT_JOB = 'mjp/jobmanager/SELECT_JOB';

const initialState = {
  businesses: [],
  workplaces: [],
  jobs: [],
  saving: false,
};

const getSelectedItem = (action, state) => {
  const { items, selectItem } = action.result;
  const selected = selectItem || state.selected || {};
  const i = _.findIndex(items, { id: selected.id });
  return i !== -1 ? items[i] : items[0];
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {

    /* business */

    case GET_BUSINESSES:
      return {
        ...state,
        loadingBusinesses: true,
      };
    case GET_BUSINESSES_SUCCESS:
      return {
        ...state,
        loadingBusinesses: false,
        businesses: action.result.items,
        selectedBusiness: getSelectedItem(action, state),
      };
    case GET_BUSINESSES_FAIL:
      return {
        ...state,
        loadingBusinesses: false,
        businesses: [],
        selectedBusiness: null,
      };
    case SAVE_BUSINESS:
      return {
        ...state,
        saving: true
      };
    case SAVE_BUSINESS_RESPONSE:
      return {
        ...state,
        saving: false,
      };
    case SELECT_BUSINESS:
      return {
        ...state,
        selectedBusiness: action.selected,
      };

    /* workplace */

    case GET_WORKPLACES:
      return {
        ...state,
        loadingWorkplaces: true,
      };
    case GET_WORKPLACES_SUCCESS:
      return {
        ...state,
        loadingWorkplaces: false,
        workplaces: action.result.items,
        selectedWorkplace: getSelectedItem(action, state),
      };
    case GET_WORKPLACES_FAIL:
      return {
        ...state,
        loadingWorkplaces: false,
        workplaces: [],
        selectedWorkplace: null,
      };
    case SAVE_WORKPLACE:
      return {
        ...state,
        saving: true
      };
    case SAVE_WORKPLACE_RESPONSE:
      return {
        ...state,
        saving: false,
      };
    case SELECT_WORKPLACE:
      return {
        ...state,
        selectedWorkplace: action.workplace,
      };

    /* job */

    case GET_JOBS:
      return {
        ...state,
        loadingJobs: true,
      };
    case GET_JOBS_SUCCESS:
      return {
        ...state,
        loadingJobs: false,
        jobs: action.result.items,
        selectedJob: getSelectedItem(action, state),
      };
    case GET_JOBS_FAIL:
      return {
        ...state,
        loadingJobs: false,
        jobs: [],
        selectedJob: null,
      };
    case SAVE_JOB:
      return {
        ...state,
        saving: true
      };
    case SAVE_JOB_RESPONSE:
      return {
        ...state,
        saving: false,
      };
    case SELECT_JOB:
      return {
        ...state,
        selectedJob: action.job,
      };

    default:
      return state;
  }
}

/* business */

export function selectBusiness(business) {
  return dispatch => {
    dispatch({ type: SELECT_BUSINESS, business });
  };
}

/* workplaces */

export function selectWorkplace(workplace) {
  return dispatch => {
    dispatch({ type: SELECT_WORKPLACE, workplace });
  };
}

/* jobs */

export function selectJob(job) {
  return dispatch => {
    dispatch({ type: SELECT_JOB, job });
  };
}

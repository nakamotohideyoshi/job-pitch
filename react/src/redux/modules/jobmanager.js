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
        loadingWorkPlaces: true,
      };
    case GET_WORKPLACES_SUCCESS:
      return {
        ...state,
        loadingWorkPlaces: false,
        workplaces: action.result.items,
        selectedWorkPlace: getSelectedItem(action, state),
      };
    case GET_WORKPLACES_FAIL:
      return {
        ...state,
        loadingWorkPlaces: false,
        workplaces: [],
        selectedWorkPlace: null,
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
        selectedWorkPlace: action.workplace,
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

export function getUserBusinesses(selectItem) {
  return {
    types: [GET_BUSINESSES, GET_BUSINESSES_SUCCESS, GET_BUSINESSES_FAIL],
    promise: client => client.getUserBusinesses('')
      .then(items => ({ items, selectItem }))
  };
}

export function saveUserBusiness(business) {
  return {
    types: [SAVE_BUSINESS, SAVE_BUSINESS_RESPONSE, SAVE_BUSINESS_RESPONSE],
    promise: client => client.saveUserBusiness(business)
  };
}

export function deleteUserBusiness(busienssId) {
  return {
    types: [SAVE_BUSINESS, SAVE_BUSINESS_RESPONSE, SAVE_BUSINESS_RESPONSE],
    promise: client => client.deleteUserBusiness(busienssId)
  };
}

export function uploadBusinessLogo(info, onUploadProgress) {
  return {
    types: [SAVE_BUSINESS, SAVE_BUSINESS_RESPONSE, SAVE_BUSINESS_RESPONSE],
    promise: client => client.uploadBusinessLogo(info, onUploadProgress)
  };
}

export function deleteBusinessLogo(logoId) {
  return {
    types: [SAVE_BUSINESS, SAVE_BUSINESS_RESPONSE, SAVE_BUSINESS_RESPONSE],
    promise: client => client.deleteBusinessLogo(logoId)
  };
}

export function selectBusiness(business) {
  return dispatch => {
    dispatch({ type: SELECT_BUSINESS, business });
  };
}

/* workplaces */

export function getUserWorkPlaces(businessId, selectItem) {
  return {
    types: [GET_WORKPLACES, GET_WORKPLACES_SUCCESS, GET_WORKPLACES_FAIL],
    promise: client => client.getUserWorkPlaces(`?business=${businessId}`)
      .then(items => ({ items, selectItem }))
  };
}

export function saveUserWorkPlace(workplace) {
  return {
    types: [SAVE_WORKPLACE, SAVE_WORKPLACE_RESPONSE, SAVE_WORKPLACE_RESPONSE],
    promise: client => client.saveUserWorkPlace(workplace)
  };
}

export function deleteUserWorkPlace(workplaceId) {
  return {
    types: [SAVE_WORKPLACE, SAVE_WORKPLACE_RESPONSE, SAVE_WORKPLACE_RESPONSE],
    promise: client => client.deleteUserWorkPlace(workplaceId)
  };
}

export function uploadWorkPlaceLogo(info, onUploadProgress) {
  return {
    types: [SAVE_WORKPLACE, SAVE_WORKPLACE_RESPONSE, SAVE_WORKPLACE_RESPONSE],
    promise: client => client.uploadWorkPlaceLogo(info, onUploadProgress)
  };
}

export function deleteWorkPlaceLogo(logoId) {
  return {
    types: [SAVE_WORKPLACE, SAVE_WORKPLACE_RESPONSE, SAVE_WORKPLACE_RESPONSE],
    promise: client => client.deleteWorkPlaceLogo(logoId)
  };
}

export function selectWorkPlace(workplace) {
  return dispatch => {
    dispatch({ type: SELECT_WORKPLACE, workplace });
  };
}

/* jobs */

export function getUserJobsByWorkPlace(workplaceId, selectItem) {
  return {
    types: [GET_JOBS, GET_JOBS_SUCCESS, GET_JOBS_FAIL],
    promise: client => client.getUserJobs(`?location=${workplaceId}`)
      .then(items => ({ items, selectItem }))
  };
}

export function saveUserJob(job) {
  return {
    types: [SAVE_JOB, SAVE_JOB_RESPONSE, SAVE_JOB_RESPONSE],
    promise: client => client.saveUserJob(job)
  };
}

export function deleteUserJob(jobId) {
  return {
    types: [SAVE_JOB, SAVE_JOB_RESPONSE, SAVE_JOB_RESPONSE],
    promise: client => client.deleteUserJob(jobId)
  };
}

export function uploadJobLogo(info, onUploadProgress) {
  return {
    types: [SAVE_JOB, SAVE_JOB_RESPONSE, SAVE_JOB_RESPONSE],
    promise: client => client.uploadJobLogo(info, onUploadProgress)
  };
}

export function deleteJobLogo(logoId) {
  return {
    types: [SAVE_JOB, SAVE_JOB_RESPONSE, SAVE_JOB_RESPONSE],
    promise: client => client.deleteJobLogo(logoId)
  };
}

export function selectJob(job) {
  return dispatch => {
    dispatch({ type: SELECT_JOB, job });
  };
}

import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';

const CALL_START = 'mjp/common/CALL_START';
const CALL_END = 'mjp/common/CALL_END';

const initialState = {
  loading: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CALL_START:
      return { ...state, loading: true };
    case CALL_END:
      return { ...state, loading: false };
    default:
      return state;
  }
}

/* common */

export function loadDataAction() {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.loadData()
      .then(data => {
        ApiClient.initialTokens = data[0];
        ApiClient.sectors = data[1];
        ApiClient.contracts = data[2];
        ApiClient.hours = data[3];
        ApiClient.nationalities = data[4];
        ApiClient.applicationStatuses = data[5];
        ApiClient.jobStatuses = data[6];
        ApiClient.sexes = data[7];
        ApiClient.roles = data[8];
        ApiClient.products = data[9];
        // ApiClient.products = utils.getTempProducts();
      })
  };
}

export function getUserAction() {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getUser()
      .then(data => {
        ApiClient.user = data;
        return Promise.resolve(data);
      })
  };
}

export function resetAction(info) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.reset(info)
  };
}

export function changePasswordAction(info) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.changePassword(info)
  };
}

/* recruiter */

export function getUserJobsAction(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getUserJobs(query)
  };
}

export function getJobSeekersAction(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getJobSeekers(query)
  };
}

export function getApplicationsAction(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getApplications(query)
  };
}

export function saveApplicationAction(application) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveApplication(application)
  };
}

export function deleteApplicationAction(appId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteApplication(appId)
  };
}

/* job seeker */

export function getJobSeekerAction(jobSeekerId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getJobSeekers(`${jobSeekerId}/`)
      .then(data => {
        ApiClient.jobSeeker = data;
        return Promise.resolve(data);
      })
  };
}


/* Job Seeker */

export function saveJobSeekerAction(jobSeeker) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveJobSeeker(jobSeeker)
  };
}

export function getJobProfileAction(profileId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getJobProfile(profileId)
  };
}
export function saveJobProfileAction(profile) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveJobProfile(profile)
  };
}

export function getJobsAction(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getJobs(query)
  };
}

export function sendMessageAction(message) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.sendMessage(message)
  };
}

export function getPitchAction(id) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getPitch(id)
  };
}

export function createPitchAction() {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.createPitch()
  };
}

export function purchaseAction(data) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.purchase(data)
  };
}

export function getUserBusinessesAction() {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getUserBusinesses('')
  };
}

export function saveUserBusinessAction(business) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveUserBusiness(business)
  };
}

export function deleteUserBusinessAction(busienssId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteUserBusiness(busienssId)
    // promise: client => client.testSuccess()
  };
}

export function uploadBusinessLogoAction(info, onUploadProgress) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.uploadBusinessLogo(info, onUploadProgress)
  };
}

export function deleteBusinessLogoAction(logoId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteBusinessLogo(logoId)
  };
}

export function getUserWorkplacesAction(businessId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getUserWorkplaces(`?business=${businessId}`)
  };
}

export function saveUserWorkplaceAction(workplace) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveUserWorkplace(workplace)
  };
}

export function deleteUserWorkplaceAction(workplaceId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteUserWorkplace(workplaceId)
  };
}

export function uploadWorkplaceLogoAction(info, onUploadProgress) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.uploadWorkplaceLogo(info, onUploadProgress)
  };
}

export function deleteWorkplaceLogoAction(logoId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteWorkplaceLogo(logoId)
  };
}

export function getUserJobsByWorkplaceAction(workplaceId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getUserJobs(`?location=${workplaceId}`)
  };
}

export function saveUserJobAction(job) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveUserJob(job)
  };
}

export function deleteUserJobAction(jobId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteUserJob(jobId)
  };
}

export function uploadJobLogoAction(info, onUploadProgress) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.uploadJobLogo(info, onUploadProgress)
  };
}

export function deleteJobLogoAction(logoId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteJobLogo(logoId)
  };
}

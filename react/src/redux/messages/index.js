import * as C from './constants';

export function getApplications(appId, withJobs) {
  return { type: C.MSG_GET_APPLICATIONS, appId, withJobs };
}

export function selectApplication(appId) {
  return { type: C.MSG_SELECT_APPLICATION, appId };
}

export function sendMessage(message) {
  return { type: C.MSG_SEND_MESSAGE, message };
}

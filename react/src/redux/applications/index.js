import * as C from './constants';

export function getApplications(jobId, statusName, shortlist) {
  return { type: C.GET_APPLICATIONS, jobId, statusName, shortlist };
}

export function connectApplication(appId) {
  return { type: C.CONNECT_APPLICATION, appId };
}

export function removeApplication(appId) {
  return { type: C.REMOVE_APPLICATION, appId };
}

export function selectApplication(application) {
  return { type: C.SELECT_APPLICATION, application };
}

export function setShortlist(shortlisted) {
  return { type: C.SET_SHORTLIST, shortlisted };
}

// message applications

export function getMsgApplications(appId) {
  return { type: C.GET_MSG_APPLICATIONS, appId };
}

export function sendMessage(message) {
  return { type: C.SEND_MESSAGE, message };
}

const CALL_START = 'mjp/common/CALL_START';
const CALL_END = 'mjp/common/CALL_END';
const SET_VALUE = 'mjp/common/SET_VALUE';
const ALERT_SHOW = 'mjp/common/ALERT_SHOW';
const ALERT_HIDE = 'mjp/common/ALERT_HIDE';

const initialState = {
  shared: {},
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CALL_START:
      return {
        ...state,
        loading: true,
      };
    case CALL_END:
      return {
        ...state,
        loading: false,
      };
    case SET_VALUE:
      const { key, value } = action;
      return {
        ...state,
        shared: { ...state.shared, [key]: value },
      };
    case ALERT_SHOW:
      return {
        ...state,
        alert: action.alert,
      };
    case ALERT_HIDE:
      return {
        ...state,
        alert: null,
      };
    default:
      return state;
  }
}

// shared data

export function setData(key, value) {
  return { type: SET_VALUE, key, value };
}

// alert

export function alertShow(title, message, cancelButton, cancelCallback, okButton, okCallback, cancel = true) {
  return { type: ALERT_SHOW, alert: { title, message, cancelButton, cancelCallback, okButton, okCallback, cancel } };
}

export function alertHide() {
  return { type: ALERT_HIDE };
}

// api

export function getJobProfile(profileId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getJobProfile(profileId)
  };
}
export function saveJobProfile(profile) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveJobProfile(profile)
  };
}


export function getUserJobs(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getUserJobs(query)
  };
}

export function getJobs(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getJobs(query)
  };
}

export function getJobSeekers(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getJobSeekers(query)
  };
}

export function saveApplication(application) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.saveApplication(application)
  };
}

export function getApplications(query) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getApplications(query)
  };
}

export function deleteApplication(appId) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.deleteApplication(appId)
  };
}

export function sendMessage(message) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.sendMessage(message)
  };
}

export function getPitch(id) {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.getPitch(id)
  };
}

export function createPitch() {
  return {
    types: [CALL_START, CALL_END, CALL_END],
    promise: client => client.createPitch()
  };
}


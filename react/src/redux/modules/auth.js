const LOADING_START = 'mjp/auth/LOADING_START';
const LOADING_END = 'mjp/auth/LOADING_END';
const LOGIN_SUCCESS = 'mjp/auth/LOGIN_SUCCESS';
const LOGOUT_SUCCESS = 'mjp/auth/LOGOUT_SUCCESS';
const GETSTATIC_SUCCESS = 'mjp/auth/GETSTATIC_SUCCESS';
const GETUSER_SUCCESS = 'mjp/auth/GETUSER_SUCCESS';
const GETJOBSEEKER_SUCCESS = 'mjp/auth/GETJOBSEEKER_SUCCESS';
const SET_PERMISSION = 'mjp/auth/SET_PERMISSION';

const initialState = {
  staticData: {},
  loading: false,
  permission: 0,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOADING_START:
      return {
        ...state,
        loading: true,
      };
    case LOADING_END:
      return {
        ...state,
        loading: false,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case GETSTATIC_SUCCESS:
      return {
        ...state,
        loading: false,
        staticData: {
          initialTokens: action.result[0],
          sectors: action.result[1],
          contracts: action.result[2],
          hours: action.result[3],
          nationalities: action.result[4],
          applicationStatuses: action.result[5],
          jobStatuses: action.result[6],
          sexes: action.result[7],
          roles: action.result[8],
        }
      };
    case GETUSER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.result,
      };
    case GETJOBSEEKER_SUCCESS:
      return {
        ...state,
        loading: false,
        jobSeeker: action.result,
      };
    case SET_PERMISSION:
      return {
        ...state,
        permission: action.permission,
      };
    default:
      return state;
  }
}

export function register(info) {
  return {
    types: [LOADING_START, LOGIN_SUCCESS, LOADING_END],
    promise: client => client.register(info)
  };
}

export function login(info) {
  return {
    types: [LOADING_START, LOGIN_SUCCESS, LOADING_END],
    promise: client => client.login(info)
  };
}

export function logout() {
  return {
    types: [LOADING_START, LOGOUT_SUCCESS, LOADING_END],
    promise: client => client.logout()
  };
}

export function reset(info) {
  return {
    types: [LOADING_START, LOADING_END, LOADING_END],
    promise: client => client.reset(info)
  };
}

export function changePassword(info) {
  return {
    types: [LOADING_START, LOADING_END, LOADING_END],
    promise: client => client.changePassword(info)
  };
}

export function getUser() {
  return {
    types: [LOADING_START, GETUSER_SUCCESS, LOADING_END],
    promise: client => client.getUser()
  };
}

export function getStaticData() {
  return {
    types: [LOADING_START, GETSTATIC_SUCCESS, LOADING_END],
    promise: client => client.getStaticData()
  };
}

/* Job Seeker */

export function getJobSeeker(jobSeekerId) {
  return {
    types: [LOADING_START, GETJOBSEEKER_SUCCESS, LOADING_END],
    promise: client => client.getJobSeekers(`${jobSeekerId}/`)
  };
}

export function saveJobSeeker(jobSeeker) {
  return {
    types: [LOADING_START, GETJOBSEEKER_SUCCESS, LOADING_END],
    promise: client => client.saveJobSeeker(jobSeeker)
  };
}

/* permission */

export function setPermission(permission) {
  return { type: SET_PERMISSION, permission };
}

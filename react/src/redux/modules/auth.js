import cookie from 'js-cookie';
import ApiClient from 'helpers/ApiClient';

const LOGIN = 'mjp/auth/LOGIN';
const LOGIN_SUCCESS = 'mjp/auth/LOGIN_SUCCESS';
const LOGIN_FAILED = 'mjp/auth/LOGIN_FAILED';

const REGISTER = 'mjp/auth/REGISTER';
const REGISTER_SUCCESS = 'mjp/auth/REGISTER_SUCCESS';
const REGISTER_FAILED = 'mjp/auth/REGISTER_FAILED';

const LOGOUT = 'mjp/auth/LOGOUT';
const LOGOUT_SUCCESS = 'mjp/auth/LOGOUT_SUCCESS';
const LOGOUT_FAILED = 'mjp/auth/LOGOUT_FAILED';

const initialState = {
  loading: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN:
      return { ...state, loading: true };
    case LOGIN_SUCCESS:
      return { ...state, loading: false };
    case LOGIN_FAILED:
      return { ...state, loading: false };

    case REGISTER:
      return { ...state, loading: true };
    case REGISTER_SUCCESS:
      return { ...state, loading: false };
    case REGISTER_FAILED:
      return { ...state, loading: false };

    case LOGOUT:
      return { ...state, loading: true };
    case LOGOUT_SUCCESS:
      return { ...state, loading: false };
    case LOGOUT_FAILED:
      return { ...state, loading: false };

    default:
      return state;
  }
}

function login(client, info) {
  return client.login(info)
    .then(data => {
      if (__DEVELOPMENT__) {
        cookie.set('token', data.key);
      }
      localStorage.setItem('email', info.email);
      // return Promise.resolve();
    });
}

function register(client, info, type) {
  return client.register(info)
    .then(() => login(client, {
      email: info.email,
      password: info.password1
    }))
    .then(() => {
      cookie.set('usertype', type);
    });
}

function logout(client) {
  return client.logout()
    .then(() => {
      ApiClient.user = null;
      ApiClient.initialTokens = null;
      ApiClient.sectors = null;
      ApiClient.contracts = null;
      ApiClient.hours = null;
      ApiClient.nationalities = null;
      ApiClient.applicationStatuses = null;
      ApiClient.jobStatuses = null;
      ApiClient.sexes = null;
      ApiClient.roles = null;
      ApiClient.products = null;
    });
}

export function loginAction(info) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAILED],
    promise: client => login(client, info)
  };
}

export function registerAction(info, type) {
  return {
    types: [REGISTER, REGISTER_SUCCESS, REGISTER_FAILED],
    promise: client => register(client, info, type)
  };
}

export function logoutAction() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAILED],
    promise: client => logout(client)
  };
}

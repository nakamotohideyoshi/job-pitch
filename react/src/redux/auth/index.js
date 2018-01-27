import * as C from './constants';

export function register(model, usertype) {
  return { type: C.REGISTER, model, usertype };
}

export function login(model) {
  return { type: C.LOGIN, model };
}

export function logout() {
  return { type: C.LOGOUT };
}

export function selectUserType(usertype) {
  return { type: C.SELECT_USERTYPE, usertype };
}

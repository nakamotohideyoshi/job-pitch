import * as C from './constants';

export function changePassword(model) {
  return { type: C.CHANGE_PASSWORD, model };
}

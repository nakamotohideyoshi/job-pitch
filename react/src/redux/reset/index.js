import * as C from './constants';

export function resetPassword(model) {
  return { type: C.RESET_PASSWORD, model };
}

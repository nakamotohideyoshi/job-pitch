import * as C from './constants';

export function loadJobProfile() {
  return { type: C.JS_JOBPROFILE_LOAD };
}

export function saveJobProfile(model) {
  return { type: C.JS_JOBPROFILE_SAVE, model };
}

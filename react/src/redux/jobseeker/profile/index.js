import * as C from './constants';

export function loadProfile() {
  return { type: C.JS_PROFILE_LOAD };
}

export function saveProfile(model, pitchData, onUploadProgress) {
  return { type: C.JS_PROFILE_SAVE, model, pitchData, onUploadProgress };
}

export function uploadPitch(jobseekerId, pitchData, onUploadProgress) {
  return { type: C.JS_PITCH_UPLOAD, jobseekerId, pitchData, onUploadProgress };
}

import { createAction } from 'redux-actions';

import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const saveJobseekerAction = createAction(C.JS_SAVE_PROFILE);
export const saveJobProfileAction = createAction(C.JS_SAVE_JOBPROFILE);
export const uploadPitchAction = createAction(C.JS_UPLOAD_PITCH);

// ------------------------------------
// Reducer
// ------------------------------------

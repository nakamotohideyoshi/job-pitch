import { createAction } from 'redux-actions';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const uploadPitch = createAction(C.JS_UPLOAD_PITCH);
export const uploadJobPitch = createAction(C.JS_UPLOAD_JOBPITCH);

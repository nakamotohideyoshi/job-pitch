import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import { requestSuccess } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const saveJobseeker = createAction(C.JS_SAVE_PROFILE);
export const saveJobProfile = createAction(C.JS_SAVE_JOBPROFILE);
export const uploadPitch = createAction(C.JS_UPLOAD_PITCH);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobseeker: null,
  profile: null
};

export default handleActions(
  {
    // ---- profile ----

    [requestSuccess(C.JS_SAVE_PROFILE)]: (state, { payload }) => ({
      ...state,
      jobseeker: payload
    }),

    // ---- job profile ----

    [requestSuccess(C.JS_SAVE_JOBPROFILE)]: (state, { payload }) => ({
      ...state,
      profile: payload
    })
  },
  initialState
);

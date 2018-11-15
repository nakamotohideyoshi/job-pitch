import { createAction, handleActions } from 'redux-actions';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

// export const getApplications = createAction(C.GET_APPLICATIONS);
export const updateApplicationAction = createAction(C.UPDATE_APPLICATION);
export const removeApplicationAction = createAction(C.REMOVE_APPLICATION);
export const newApplicationAction = createAction(C.NEW_APPLICATION);

export const readMessageAction = createAction(C.READ_MESSAGE);
export const sendMessageAction = createAction(C.SEND_MESSAGE);

export const saveInterviewAction = createAction(C.SAVE_INTERVIEW);
export const changeInterviewAction = createAction(C.CHANGE_INTERVIEW);
export const completeInterviewAction = createAction(C.COMPLETE_INTERVIEW);
export const removeInterviewAction = createAction(C.REMOVE_INTERVIEW);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  applications: []
};

export default handleActions(
  {
    // ---- get applications ----

    [requestSuccess(C.GET_APPLICATIONS)]: (state, { payload }) => ({
      ...state,
      applications: payload && payload.map(app => ({ ...app, loading: false }))
    }),

    // ---- update application ----

    [requestPending(C.UPDATE_APPLICATION)]: (state, { appId }) => ({
      ...state,
      applications: helper.updateItem(state.applications, {
        id: appId,
        loading: true
      })
    }),

    [requestSuccess(C.UPDATE_APPLICATION)]: (state, { application }) => ({
      ...state,
      applications: helper.updateItem(state.applications, { ...application, loading: false }, true)
    }),

    [requestFail(C.UPDATE_APPLICATION)]: (state, { appId }) => ({
      ...state,
      applications: helper.updateItem(state.applications, {
        id: appId,
        loading: false
      })
    }),

    [C.LOGOUT]: () => initialState
  },
  initialState
);

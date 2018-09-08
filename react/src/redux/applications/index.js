import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';

// ------------------------------------
// Actions
// ------------------------------------

export const getApplications = createAction(C.GET_APPLICATIONS);
export const updateApplication = createAction(C.UPDATE_APPLICATION);
export const removeApplication = createAction(C.REMOVE_APPLICATION);

export const readMessage = createAction(C.READ_MESSAGE);
export const sendMessage = createAction(C.SEND_MESSAGE);

export const saveInterview = createAction(C.SAVE_INTERVIEW);
export const changeInterview = createAction(C.CHANGE_INTERVIEW);
export const completeInterview = createAction(C.COMPLETE_INTERVIEW);
export const removeInterview = createAction(C.REMOVE_INTERVIEW);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  applications: null
};

export default handleActions(
  {
    // ---- get applications ----

    [requestSuccess(C.GET_APPLICATIONS)]: (state, { payload }) => ({
      ...state,
      applications: payload.map(app => ({ ...app, loading: false }))
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

    // ---- change location ----

    [LOCATION_CHANGE]: (state, { payload }) => {
      let { applications } = state;
      if (payload.pathname.split('/')[1] === 'auth') {
        applications = null;
      }
      return {
        ...state,
        applications
      };
    }
  },
  initialState
);

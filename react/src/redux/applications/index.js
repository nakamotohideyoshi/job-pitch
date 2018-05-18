import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.APPLICATIONS_UPDATE);
export const getApplications = createAction(C.GET_APPLICATIONS);
export const connectApplication = createAction(C.CONNECT_APPLICATION);
export const updateApplication = createAction(C.UPDATE_APPLICATION);
export const removeApplication = createAction(C.REMOVE_APPLICATION);
export const sendMessage = createAction(C.SEND_MESSAGE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  applications: null,
  error: null
};

export default handleActions(
  {
    [C.APPLICATIONS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get applications ----

    [requestPending(C.GET_APPLICATIONS)]: state => ({
      ...state,
      applications: null,
      error: null
    }),

    [requestSuccess(C.GET_APPLICATIONS)]: (state, { payload }) => ({
      ...state,
      applications: payload
    }),

    [requestFail(C.GET_APPLICATIONS)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- update application ----

    [requestPending(C.UPDATE_APPLICATION)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.UPDATE_APPLICATION)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        ...payload,
        loading: false
      })
    }),

    [requestFail(C.UPDATE_APPLICATION)]: (state, { request }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: request.id,
        loading: false
      })
    }),

    // send message

    [C.SEND_MESSAGE]: (state, { payload }) => {
      const appId = payload.data.application;
      const application = helper.getItemByID(state.applications, appId);
      const messages = application.messages.slice(0);
      messages.push({
        id: payload.id,
        content: payload.data.content,
        sending: true
      });

      return {
        ...state,
        applications: helper.updateObj(state.applications, {
          id: appId,
          messages
        })
      };
    },

    [requestSuccess(C.SEND_MESSAGE)]: (state, { payload }) => {
      const applications = helper.removeObj(state.applications, payload.id);
      applications.unshift(payload);
      return {
        ...state,
        applications
      };
    },

    [requestFail(C.SEND_MESSAGE)]: (state, { payload }) => {
      const appId = payload.data.application;
      const application = helper.getItemByID(state.applications, appId);
      const messages = helper.updateObj(application.messages, {
        id: payload.id,
        sending: false,
        error: true
      });

      return {
        ...state,
        applications: helper.updateObj(state.applications, {
          id: appId,
          messages
        })
      };
    },

    // ---- change location ----

    [LOCATION_CHANGE]: (state, { payload }) => {
      const key = payload.pathname.split('/')[2];
      const clear = key !== 'applications' && key !== 'messages';
      return {
        ...state,
        applications: clear ? null : state.applications
      };
    }
  },
  initialState
);

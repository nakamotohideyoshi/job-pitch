import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import DATA from 'utils/data';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';

// ------------------------------------
// Actions
// ------------------------------------

export const getApplications = createAction(C.RC_GET_APPS1);
export const connectApplication = createAction(C.RC_CONNECT_APP1);
export const updateApplication = createAction(C.RC_UPDATE_APP1);
export const removeApplication = createAction(C.RC_REMOVE_APP1);
export const sendMessage = createAction(C.RC_SEND_MESSAGE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  applications: null,
  error: null
};

export default handleActions(
  {
    [C.RC_GET_APPS1]: () => state => ({
      ...state,
      applications: null,
      error: null
    }),

    [requestSuccess(C.RC_GET_APPS1)]: (state, { payload }) => ({
      ...state,
      applications: payload
    }),

    [requestFail(C.RC_GET_APPS1)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- update application ----

    [requestPending(C.RC_UPDATE_APP1)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.data.id,
        updating: true
      })
    }),

    [requestSuccess(C.RC_UPDATE_APP1)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        ...payload.data,
        updating: false
      })
    }),

    [requestFail(C.RC_UPDATE_APP1)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.data.id,
        updating: false
      })
    }),

    // ---- remove application ----

    [requestPending(C.RC_REMOVE_APP1)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.id,
        removing: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_APP1)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.id,
        status: DATA.APP.DELETED,
        removing: false
      })
    }),

    [requestFail(C.RC_REMOVE_APP1)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.id,
        removing: false
      })
    }),

    // send message

    [C.RC_SEND_MESSAGE]: (state, { payload }) => {
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

    [requestSuccess(C.RC_SEND_MESSAGE)]: (state, { payload }) => {
      const { application } = payload;
      const applications = helper.removeObj(state.applications, application.id);
      applications.unshift(application);
      return {
        ...state,
        applications
      };
    },

    [requestFail(C.RC_SEND_MESSAGE)]: (state, { payload }) => {
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
    }
  },

  initialState
);

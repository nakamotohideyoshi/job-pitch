import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import DATA from 'utils/data';

const getNewMsgCount = messages => {
  let count = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.read) break;

    const userRole = helper.getNameByID('roles', msg.from_role);
    if (userRole === DATA.userRole) break;

    count++;
  }
  return count;
};

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.APPLICATIONS_UPDATE);
export const getApplications = createAction(C.GET_APPLICATIONS);
export const connectApplication = createAction(C.CONNECT_APPLICATION);
export const updateApplication = createAction(C.UPDATE_APPLICATION);
export const removeApplication = createAction(C.REMOVE_APPLICATION);
export const readMessage = createAction(C.READ_MESSAGE);
export const sendMessage = createAction(C.SEND_MESSAGE);
export const updateMessageByInterview = createAction(C.UPDATE_MESSAGE_BY_INTERVIEW);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  applications: null,
  error: null,
  allNewMsgs: 0
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
      error: null
    }),

    [requestSuccess(C.GET_APPLICATIONS)]: (state, { payload }) => {
      let allNewMsgs = 0;
      const applications = payload.map(app => {
        app.newMsgs = getNewMsgCount(app.messages);
        allNewMsgs += app.newMsgs;

        const oldApp = helper.getItemByID(state.applications, app.id);
        if (oldApp) {
          const sendingMessages = oldApp.messages.filter(({ sending }) => sending);
          app.messages.concat(sendingMessages);
        }

        return app;
      });

      return {
        ...state,
        applications,
        allNewMsgs
      };
    },

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

    // UPDATE_MESSAGE_BY_INTERVIEW

    [C.UPDATE_MESSAGE_BY_INTERVIEW]: (state, { payload }) => {
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

    [requestSuccess(C.UPDATE_MESSAGE_BY_INTERVIEW)]: (state, { payload }) => {
      const applications = helper.removeObj(state.applications, payload.id);
      applications.unshift(payload);
      return {
        ...state,
        applications
      };
    },

    [requestFail(C.UPDATE_MESSAGE_BY_INTERVIEW)]: (state, { payload }) => {
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

    // read message

    [requestSuccess(C.READ_MESSAGE)]: (state, { request }) => {
      const { appId, id, data } = request;
      const application = helper.getItemByID(state.applications, appId);
      const messages = helper.updateObj(application.messages, {
        id,
        ...data
      });

      const newMsgs = getNewMsgCount(messages);
      const applications = helper.updateObj(state.applications, {
        id: appId,
        messages,
        newMsgs
      });

      let allNewMsgs = 0;
      applications.forEach(({ newMsgs }) => {
        allNewMsgs += newMsgs;
      });

      return {
        ...state,
        applications,
        allNewMsgs
      };
    },

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
      let { applications, allNewMsgs } = state;
      if (payload.pathname.split('/')[1] === 'auth') {
        applications = null;
        allNewMsgs = 0;
      }
      return {
        ...state,
        applications,
        allNewMsgs
      };
    }
  },
  initialState
);

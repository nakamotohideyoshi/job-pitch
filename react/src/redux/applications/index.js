import { createAction, handleActions } from 'redux-actions';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import DATA from 'utils/data';
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
  error: null,
  searchText: ''
};

export default handleActions(
  {
    [C.APPLICATIONS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get applications ----

    [requestPending(C.GET_APPLICATIONS)]: (state, { payload }) => ({
      ...state,
      applications: payload.clear ? null : state.applications
    }),

    [requestSuccess(C.GET_APPLICATIONS)]: (state, { payload }) => ({
      ...state,
      applications: payload
    }),

    [requestFail(C.GET_APPLICATIONS)]: (state, { payload }) => ({
      ...state,
      error: payload
    }),

    // ---- connect application ----

    [requestPending(C.CONNECT_APPLICATION)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.data.id,
        updating: true
      })
    }),

    [requestSuccess(C.CONNECT_APPLICATION)]: (state, { request }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: request.data.id,
        status: DATA.APP.ESTABLISHED,
        updating: false
      })
    }),

    [requestFail(C.CONNECT_APPLICATION)]: (state, { request }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: request.data.id,
        updating: false
      })
    }),

    // ---- update application ----

    [requestPending(C.UPDATE_APPLICATION)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.data.id,
        updating: true
      })
    }),

    [requestSuccess(C.UPDATE_APPLICATION)]: (state, { request }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        ...request.data,
        updating: false
      })
    }),

    [requestFail(C.UPDATE_APPLICATION)]: (state, { request }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: request.data.id,
        updating: false
      })
    }),

    // ---- remove application ----

    [requestPending(C.REMOVE_APPLICATION)]: (state, { payload }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: payload.id,
        removing: true
      })
    }),

    [requestSuccess(C.REMOVE_APPLICATION)]: (state, { request }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: request.id,
        status: DATA.APP.DELETED,
        removing: false
      })
    }),

    [requestFail(C.REMOVE_APPLICATION)]: (state, { request }) => ({
      ...state,
      applications: helper.updateObj(state.applications, {
        id: request.id,
        removing: false
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
      const { application } = payload;
      const applications = helper.removeObj(state.applications, application.id);
      applications.unshift(application);
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
    }
  },
  initialState
);

import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import DATA from 'utils/data';
import { requestPending, requestSuccess, requestFail } from 'utils/request';
import _ from 'lodash';

// ------------------------------------
// Actions
// ------------------------------------

export const getData = createAction(C.RC_GET_APPS1);
export const connectApplication = createAction(C.RC_CONNECT_APP1);
export const updateApplication = createAction(C.RC_UPDATE_APP1);
export const removeApplication = createAction(C.RC_REMOVE_APP1);
export const sendMessage = createAction(C.RC_SEND_MESSAGE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: null,
  applications: null,
  error: null,

  updating: null, // id
  removing: null // id
};

export default handleActions(
  {
    [C.RC_GET_APPS1]: () => initialState,

    [requestSuccess(C.RC_GET_APPS1)]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    [requestFail(C.RC_GET_APPS1)]: (state, { payload }) => ({
      ...state,
      error: {
        ...state.error,
        ...payload
      }
    }),

    // ---- update application ----

    [requestPending(C.RC_UPDATE_APP1)]: (state, { payload: { id } }) => ({
      ...state,
      updating: id
    }),

    [requestSuccess(C.RC_UPDATE_APP1)]: (state, { payload: { data } }) => ({
      ...state,
      updating: null,
      applications: helper.updateObj(state.applications, data)
    }),

    [requestFail(C.RC_UPDATE_APP1)]: state => ({
      ...state,
      updating: null
    }),

    // ---- remove application ----

    [requestPending(C.RC_REMOVE_APP1)]: (state, { payload: { id } }) => ({
      ...state,
      removing: id
    }),

    [requestSuccess(C.RC_REMOVE_APP1)]: (state, { payload: { id } }) => ({
      ...state,
      removing: null,
      applications: helper.updateObj(state.applications, {
        id,
        status: DATA.APP.DELETED
      })
    }),

    [requestFail(C.RC_REMOVE_APP1)]: state => ({
      ...state,
      removing: null
    }),

    // send message

    [requestPending(C.RC_SEND_MESSAGE)]: (state, { payload }) => {
      const application = helper.getItemByID(state.applications, payload.application);
      const messages = application.messages.slice(0);
      messages.push({ id: -1, content: payload.content });
      return {
        ...state,
        applications: helper.updateObj(state.applications, {
          id: application.id,
          messages
        })
      };
    },

    [requestSuccess(C.RC_SEND_MESSAGE)]: (state, { payload }) => {
      const { application } = payload;
      const applications = helper.removeObj(state.applications, application.id);
      application.push(application);
      return {
        ...state,
        applications
      };
    },

    [requestFail(C.RC_SEND_MESSAGE)]: (state, { payload }) => ({
      ...state
    })
  },

  initialState
);

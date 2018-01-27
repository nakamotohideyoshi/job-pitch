import { LOCATION_CHANGE } from 'react-router-redux';
import { cloneObj } from 'utils/helper';
import * as C from './constants';

const initialState = {
  jobs: null,
  applications: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    /**
    |--------------------------------------------------
    | applications
    |--------------------------------------------------
    */

    // get applications

    case C.MSG_GET_APPLICATIONS:
      return {
        ...state,
        selectedApp: null
      };

    case C.MSG_GET_APPLICATIONS_SUCCESS:
      return {
        ...state,
        jobs: action.jobs,
        applications: action.applications,
        selectedApp: action.selectedApp
      };

    case C.MSG_GET_APPLICATIONS_ERROR:
      return {
        ...state,
        applications: [],
        errors: action.errors
      };

    // select applications

    case C.MSG_SELECT_APPLICATION_SUCCESS:
      return {
        ...state,
        selectedApp: action.selectedApp
      };

    /**
    |--------------------------------------------------
    | send message
    |--------------------------------------------------
    */

    case C.MSG_SEND_MESSAGE: {
      const messages = state.selectedApp.messages.slice(0);
      messages.push({ content: action.message });
      const selectedApp = cloneObj(state.selectedApp, { messages });
      return {
        ...state,
        selectedApp
      };
    }

    case C.MSG_SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        selectedApp: action.application,
        applications: cloneObj(state.applications, action.application)
      };

    case C.MSG_SEND_MESSAGE_ERROR: {
      const messages = state.selectedApp.messages.slice(0);
      messages.pop();
      const selectedApp = cloneObj(state.selectedApp, { messages });
      return {
        ...state,
        selectedApp,
        errors: action.errors
      };
    }

    /**
    |--------------------------------------------------
    | LOCATION_CHANGE
    |--------------------------------------------------
    */

    case LOCATION_CHANGE:
      return {
        ...state,
        errors: action.errors
      };

    default:
      return state;
  }
}

import { updateObj, getIDByName } from 'utils/helper';
import * as C from './constants';

const initialState = {
  applications: null,
  selectedApp: null,
  errors: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    /**
    |--------------------------------------------------
    | load applications
    |--------------------------------------------------
    */

    case C.GET_MSG_APPLICATIONS:
    case C.GET_APPLICATIONS:
      return initialState;

    case C.GET_APPLICATIONS_SUCCESS:
      return {
        ...state,
        applications: action.applications,
        selectedApp: action.selectedApp
      };

    case C.GET_APPLICATIONS_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    /**
    |--------------------------------------------------
    | connect, remove application
    |--------------------------------------------------
    */

    case C.CONNECT_APPLICATION:
    case C.REMOVE_APPLICATION:
      return {
        ...state,
        applications: updateObj(state.applications, {
          id: action.appId,
          loading: true
        })
      };

    case C.CONNECT_APPLICATION_SUCCESS:
      return {
        ...state,
        applications: updateObj(state.applications, {
          id: action.appId,
          status: getIDByName('appStatuses', 'ESTABLISHED'),
          loading: false
        })
      };

    case C.REMOVE_APPLICATION_SUCCESS:
      return {
        ...state,
        applications: updateObj(state.applications, {
          id: action.appId,
          status: getIDByName('appStatuses', 'DELETED'),
          loading: false
        })
      };

    case C.CONNECT_APPLICATION_ERROR:
    case C.REMOVE_APPLICATION_ERROR:
      return {
        ...state,
        applications: updateObj(state.applications, {
          id: action.appId,
          loading: false
        })
      };

    /**
    |--------------------------------------------------
    | select application
    |--------------------------------------------------
    */

    case C.SELECT_APPLICATION:
      return {
        ...state,
        selectedApp: state.applications.filter(app => app.id === action.appId)[0]
      };

    /**
    |--------------------------------------------------
    | set shortlist
    |--------------------------------------------------
    */

    case C.SET_SHORTLIST:
      return {
        ...state,
        selectedApp: updateObj(state.selectedApp, {
          shortlisting: true
        })
      };

    case C.SET_SHORTLIST_SUCCESS:
      return {
        ...state,
        selectedApp: updateObj(state.selectedApp, {
          shortlisting: false,
          shortlisted: action.shortlisted
        }),
        applications: updateObj(state.applications, {
          id: state.selectedApp.id,
          shortlisted: action.shortlisted
        })
      };

    case C.SET_SHORTLIST_ERROR:
      return {
        ...state,
        selectedApp: updateObj(state.selectedApp, {
          shortlisting: false
        })
      };

    /**
    |--------------------------------------------------
    | send message
    |--------------------------------------------------
    */

    case C.SEND_MESSAGE: {
      const messages = state.selectedApp.messages.slice(0);
      messages.push({ content: action.message });
      const selectedApp = updateObj(state.selectedApp, { messages });
      return {
        ...state,
        selectedApp
      };
    }

    case C.SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        selectedApp: action.application,
        applications: updateObj(state.applications, action.application)
      };

    case C.SEND_MESSAGE_ERROR: {
      const messages = state.selectedApp.messages.slice(0);
      messages.pop();
      const selectedApp = updateObj(state.selectedApp, { messages });
      return {
        ...state,
        selectedApp
      };
    }

    default:
      return state;
  }
}

import { LOCATION_CHANGE } from 'react-router-redux';
import { cloneObj, removeObj } from 'utils/helper';
import * as C from './constants';

const initialState = {
  workplaces: null,
  selectedWorkplace: null,
  errors: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // load
    case C.RC_GET_WORKPLACES:
      return initialState;

    case C.RC_GET_WORKPLACES_SUCCESS:
      return {
        ...state,
        workplaces: action.workplaces
      };

    case C.RC_GET_WORKPLACES_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // remove
    case C.RC_WORKPLACE_REMOVE:
      return {
        ...state,
        workplaces: cloneObj(state.workplaces, {
          id: action.workplaceId,
          deleting: true
        })
      };
    case C.RC_WORKPLACE_REMOVE_SUCCESS:
      return {
        ...state,
        workplaces: removeObj(state.workplaces, action.workplaceId)
      };
    case C.RC_WORKPLACE_REMOVE_ERROR:
      return {
        ...state,
        workplaces: cloneObj(state.workplaces, {
          id: action.workplaceId,
          deleting: false
        })
      };

    // load
    case C.RC_WORKPLACE_GET_SUCCESS:
      return {
        ...state,
        selectedWorkplace: action.workplace
      };
    case C.RC_WORKPLACE_GET_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // save
    case C.RC_WORKPLACE_SAVE:
      return {
        ...state,
        selectedWorkplace: cloneObj(state.selectedWorkplace, {
          saving: true
        }),
        errors: null
      };
    case C.RC_WORKPLACE_SAVE_SUCCESS:
      return {
        ...state,
        selectedWorkplace: action.workplace
      };
    case C.RC_WORKPLACE_SAVE_ERROR:
      return {
        ...state,
        selectedWorkplace: cloneObj(state.selectedWorkplace, {
          saving: false
        }),
        errors: action.errors
      };

    default:
      return state;
  }
}

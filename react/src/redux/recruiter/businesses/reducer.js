import { LOCATION_CHANGE } from 'react-router-redux';
import { cloneObj, removeObj } from 'utils/helper';
import * as C from './constants';

const initialState = {
  businesses: null,
  selectedBusiness: null,
  errors: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // load
    case C.RC_GET_BUSINESSES:
      return initialState;
    case C.RC_GET_BUSINESSES_SUCCESS:
      return {
        ...state,
        businesses: action.businesses
      };
    case C.RC_GET_BUSINESSES_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // remove
    case C.RC_BUSINESS_REMOVE:
      return {
        ...state,
        businesses: cloneObj(state.businesses, {
          id: action.businessId,
          deleting: true
        })
      };
    case C.RC_BUSINESS_REMOVE_SUCCESS:
      return {
        ...state,
        businesses: removeObj(state.businesses, action.businessId)
      };
    case C.RC_BUSINESS_REMOVE_ERROR:
      return {
        ...state,
        businesses: cloneObj(state.businesses, {
          id: action.businessId,
          deleting: false
        })
      };

    // load
    case C.RC_BUSINESS_GET_SUCCESS:
      return {
        ...state,
        selectedBusiness: action.business
      };
    case C.RC_BUSINESS_GET_ERROR:
      return {
        ...state,
        errors: action.errors
      };

    // save
    case C.RC_BUSINESS_SAVE:
      return {
        ...state,
        selectedBusiness: cloneObj(state.selectedBusiness, {
          saving: true
        }),
        errors: null
      };
    case C.RC_BUSINESS_SAVE_SUCCESS:
      return {
        ...state,
        selectedBusiness: action.business
      };
    case C.RC_BUSINESS_SAVE_ERROR:
      return {
        ...state,
        selectedBusiness: cloneObj(state.selectedBusiness, {
          saving: false
        }),
        errors: action.errors
      };

    default:
      return state;
  }
}

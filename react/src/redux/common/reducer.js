import { LOCATION_CHANGE } from 'react-router-redux';
import { CONFIRM } from './constants';

const initialState = {};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CONFIRM:
      return {
        ...state,
        confirmInfo: action.confirmInfo
      };

    case LOCATION_CHANGE:
      return {
        ...state,
        confirmInfo: null
      };

    default:
      return state;
  }
}

// import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import { requestSuccess } from 'utils/request';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------
export const updateCount = createAction(C.UPDATE_COUNT);
export const updateLatest = createAction(C.UPDATE_LATEST);
export const clearUpdated = createAction(C.CLEAR_UPDATED);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  count: 0,
  latest: '',
  updated: false
};

export default handleActions(
  {
    [C.MESSAGES_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    [requestSuccess(C.UPDATE_LATEST)]: (state, { payload }) => ({
      ...state,
      ...payload,
      updated: true
    })
  },
  initialState
);

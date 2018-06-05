// import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
// import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const updateCount = createAction(C.UPDATE_COUNT);
export const updateLatest = createAction(C.UPDATE_LATEST);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  count: 0,
  latest: ''
};

export default handleActions(
  {
    [C.MESSAGES_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    })
    // ---- change location ----

    // [C.COUNT_UPDATE]: (state, { payload }) => {
    //   console.log('{{{}}}}}', payload);
    //   let { count, latest } = payload;
    //   return {
    //     ...state,
    //     count: count,
    //     latest: latest
    //   };
    // }
  },
  initialState
);

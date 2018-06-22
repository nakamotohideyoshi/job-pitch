import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.INTERVIEWS_UPDATE);
export const getInterviews = createAction(C.GET_INTERVIEWS);
export const removeInterview = createAction(C.REMOVE_INTERVIEW);
export const saveInterview = createAction(C.SAVE_INTERVIEW);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  interviews: null
};

export default handleActions(
  {
    [C.INTERVIEWS_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get interviews ----

    [requestPending(C.GET_INTERVIEWS)]: state => initialState,

    [requestSuccess(C.GET_INTERVIEWS)]: (state, { payload }) => ({
      ...state,
      interviews: payload
    }),

    [requestFail(C.GET_INTERVIEWS)]: state => ({
      ...state,
      interviews: []
    }),

    // ---- remove interview ----

    [requestPending(C.REMOVE_INTERVIEW)]: (state, { payload }) => ({
      ...state,
      interviews: helper.updateObj(state.interviews, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.REMOVE_INTERVIEW)]: (state, { request }) => ({
      ...state,
      interviews: helper.removeObj(state.interviews, request.id)
    }),

    [requestFail(C.REMOVE_INTERVIEW)]: (state, { request }) => ({
      ...state,
      interviews: helper.updateObj(state.interviews, {
        id: request.id,
        loading: false
      })
    }),

    // ---- save interview ----

    [requestPending(C.SAVE_INTERVIEW)]: (state, { payload }) => ({
      ...state,
      interviews: helper.updateObj(state.interviews, {
        id: payload.data.id,
        loading: true
      })
    }),

    [requestSuccess(C.SAVE_INTERVIEW)]: (state, { request }) => ({
      ...state,
      interviews: helper.updateObj(state.interviews, {
        id: request.data.id,
        loading: false
      })
    }),

    [requestFail(C.SAVE_INTERVIEW)]: (state, { request }) => ({
      ...state,
      interviews: helper.updateObj(state.interviews, {
        id: request.data.id,
        loading: false
      })
    }),

    // ---- update interview ----

    [C.UPDATE_INTERVIEW]: (state, { payload }) => ({
      ...state,
      interviews: helper.updateObj(state.interviews, payload)
    })
  },
  initialState
);

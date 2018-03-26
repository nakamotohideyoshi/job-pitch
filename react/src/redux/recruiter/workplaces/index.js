import { LOCATION_CHANGE } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { requestPending, requestSuccess, requestFail } from 'utils/request';

// ------------------------------------
// Actions
// ------------------------------------

export const updateStatus = createAction(C.RC_WORKPLACES_UPDATE);
export const getWorkplaces = createAction(C.RC_GET_WORKPLACES);
export const removeWorkplace = createAction(C.RC_REMOVE_WORKPLACE);
export const getWorkplace = createAction(C.RC_GET_WORKPLACE);
export const saveWorkplace = createAction(C.RC_SAVE_WORKPLACE);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  workplaces: [],
  loading: false,
  error: null,
  refreshList: true,

  workplace: null,
  saving: false
};

export default handleActions(
  {
    [C.RC_WORKPLACES_UPDATE]: (state, { payload }) => ({
      ...state,
      ...payload
    }),

    // ---- get workplace ----

    [requestPending(C.RC_GET_WORKPLACES)]: state => ({
      ...state,
      loading: true,
      error: null
    }),

    [requestSuccess(C.RC_GET_WORKPLACES)]: (state, { payload }) => ({
      ...state,
      workplaces: payload,
      loading: false,
      refreshList: false
    }),

    [requestFail(C.RC_GET_WORKPLACES)]: (state, { payload }) => ({
      ...state,
      workplaces: [],
      loading: false,
      error: payload
    }),

    // ---- remove workplace ----

    [requestPending(C.RC_REMOVE_WORKPLACE)]: state => ({
      ...state,
      loading: true
    }),

    [requestSuccess(C.RC_REMOVE_WORKPLACE)]: (state, { payload }) => ({
      ...state,
      loading: false,
      workplaces: helper.removeObj(state.workplaces, payload.id)
    }),

    [requestFail(C.RC_REMOVE_WORKPLACE)]: state => ({
      ...state,
      loading: false
    }),

    // ---- get workplace ----

    [requestSuccess(C.RC_GET_WORKPLACE)]: (state, { payload }) => ({
      ...state,
      workplace: payload
    }),

    [requestFail(C.RC_GET_WORKPLACE)]: state => ({
      ...state,
      workplace: null
    }),

    // ---- save workplace ----

    [requestPending(C.RC_SAVE_WORKPLACE)]: state => ({
      ...state,
      saving: true
    }),

    [requestSuccess(C.RC_SAVE_WORKPLACE)]: state => ({
      ...state,
      saving: false,
      refreshList: true
    }),

    [requestFail(C.RC_SAVE_WORKPLACE)]: state => ({
      ...state,
      saving: false
    }),

    [LOCATION_CHANGE]: (state, { payload: { pathname } }) => {
      const reset = pathname.indexOf('/recruiter/jobs/workplace') !== 0;
      return {
        ...state,
        refreshList: reset || state.refreshList,
        workplaces: reset ? [] : state.workplaces
      };
    }
  },
  initialState
);

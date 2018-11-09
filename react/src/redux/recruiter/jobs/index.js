import { createAction, handleActions } from 'redux-actions';

import { requestPending, requestSuccess, requestFail } from 'utils/request';
import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const removeJobAction = createAction(C.RC_REMOVE_JOB);
export const saveJobAction = createAction(C.RC_SAVE_JOB);
export const uploadPitchAction = createAction(C.RC_UPLOAD_JOBPITCH);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  jobs: []
};

export default handleActions(
  {
    // ---- get jobs ----

    [requestSuccess(C.RC_GET_JOBS)]: (state, { payload }) => ({
      ...state,
      jobs: payload
    }),

    // ---- update job ----

    [C.RC_UPDATE_JOB]: (state, { job }) => {
      // let jobs = helper.updateItem(state.jobs, job, true);
      // jobs.sort((a, b) => {
      //   const sort1 = a.status - b.status;
      //   if (sort1 !== 0) return sort1;
      //   return new Date(b.created).getTime() - new Date(a.created).getTime();
      // });
      return {
        ...state,
        jobs: helper.updateItem(state.jobs, job, true)
      };
    },

    // ---- remove job ----

    [requestPending(C.RC_REMOVE_JOB)]: (state, { payload }) => ({
      ...state,
      jobs: helper.updateItem(state.jobs, {
        id: payload.id,
        loading: true
      })
    }),

    [requestSuccess(C.RC_REMOVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.removeItem(state.jobs, request.id)
    }),

    [requestFail(C.RC_REMOVE_JOB)]: (state, { request }) => ({
      ...state,
      jobs: helper.updateItem(state.jobs, {
        id: request.id,
        loading: false
      })
    }),

    [C.LOGOUT]: () => initialState
  },
  initialState
);

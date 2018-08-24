import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import request, { getRequest, deleteRequest, weakRequest } from 'utils/request';

const getInterviews = weakRequest(
  getRequest({
    url: '/api/interviews/'
  })
);

const removeInterview = deleteRequest({
  url: ({ id }) => `/api/interviews/${id}/`
});

function* saveInterview(action) {
  const { id, onSuccess, onFail } = action.payload.data;

  const interview = yield call(
    request({
      method: id ? 'put' : 'post',
      url: id ? `/api/interviews/${id}/` : `/api/interviews/`
    }),
    action
  );

  if (!interview) {
    onFail && onFail('Saving is failed.');
    return;
  }

  let { interviews: { interviews } } = yield select();
  if (id) {
    interviews = helper.updateObj(interviews, interview);
  } else {
    interviews = helper.addObj(interviews, interview);
  }

  yield put({ type: C.INTERVIEWS_UPDATE, payload: { interviews } });

  onSuccess && onSuccess(interview);
}

function* changeInterview(action) {
  const { id, changeType, onSuccess, onFail } = action.payload.data;

  const interview = yield call(
    request({
      method: 'post',
      url: `/api/interviews/${id}/${changeType}/`
    }),
    action
  );

  if (!interview) {
    onFail && onFail('Saving is failed.');
    return;
  }

  let { interviews: { interviews } } = yield select();
  if (id) {
    interviews = helper.updateObj(interviews, interview);
  } else {
    interviews = helper.addObj(interviews, interview);
  }

  yield put({ type: C.INTERVIEWS_UPDATE, payload: { interviews } });

  onSuccess && onSuccess(interview);
}

export default function* sagas() {
  yield takeLatest(C.GET_INTERVIEWS, getInterviews);
  yield takeLatest(C.REMOVE_INTERVIEW, removeInterview);
  yield takeLatest(C.SAVE_INTERVIEW, saveInterview);
  yield takeLatest(C.CHANGE_INTERVIEW, changeInterview);
}

import { takeEvery, takeLatest, put } from 'redux-saga/effects';
import * as helper from 'utils/helper';
import { weakRequest, putRequest } from 'utils/request';
import * as C from 'redux/constants';

function* updateCount(action) {
  console.log('app', action.payload);
  let { count, latest } = helper.getNewMessages(action.payload);
  yield put({ type: C.MESSAGES_UPDATE, payload: { count, latest } });
}

const updateLatest = weakRequest(
  putRequest({
    url: ({ id }) => `/api/messages/${id}/`
  })
);

// function* updateLatest(action) {
//     yield call(putRequest({
//         url: ({ id }) => `/api/messages/${id}/`,
//       }), action);
//   }

export default function* sagas() {
  yield takeEvery(C.UPDATE_COUNT, updateCount);
  yield takeLatest(C.UPDATE_LATEST, updateLatest);
}

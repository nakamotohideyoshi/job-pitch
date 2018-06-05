import { takeEvery, takeLatest, put, call } from 'redux-saga/effects';
import * as helper from 'utils/helper';
import { weakRequest, putRequest } from 'utils/request';
import * as C from 'redux/constants';

function* updateCount(action) {
  let { count, latest } = helper.getNewMessages(action.payload);
  yield put({ type: C.MESSAGES_UPDATE, payload: { count, latest } });
}

const updateLatest = weakRequest(
  putRequest({
    type: C.MESSAGES_UPDATE,
    url: ({ id }) => `/api/messages/${id}/`,
    payloadOnSuccess: ({ id }) => ({ count: 0, latest: id })
  })
);

// function* updateLatest(action) {
//   console.log('ttt', action.payload);
//   const id = action.payload.id;
//   yield call(
//     putRequest({
//       url: `/api/messages/${id}/`,
//       payloadOnSuccess: ({ id }) => ({ count: 0, latest: id })
//     }),
//     action
//   );
// }

export default function* sagas() {
  yield takeEvery(C.UPDATE_COUNT, updateCount);
  yield takeLatest(C.UPDATE_LATEST, updateLatest);
}

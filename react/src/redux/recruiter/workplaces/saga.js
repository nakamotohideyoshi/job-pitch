import { takeLatest, call, put, race, take, select } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { message } from 'antd';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { getRequest, postRequest, putRequest, deleteRequest, requestSuccess } from 'utils/request1';

function* getWorkplaces(action) {
  yield race({
    result: call(getRequest({ url: `/api/user-locations/` }), action),
    cancel: take(LOCATION_CHANGE)
  });
}

const removeWorkplace = deleteRequest({
  url: action => `/api/user-locations/${action.payload.id}/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => payload
});

// function* getWorkplace(action) {
//   const { rc_workplaces } = yield select();
//   const { workplaces } = rc_workplaces || {};
//   const { id, success } = action.payload;
//   const workplace = helper.getItemByID(workplaces || [], id);
//   if (workplace) {
//     yield put({ type: requestSuccess(C.RC_GET_WORKPLACE), payload: workplace });
//     success && success(workplace);
//   } else {
//     yield call(getRequest({ url: `/api/user-locations/${id}/` }), action);
//   }
// }

function* saveWorkplace(action) {
  const { data, logo, onUploading } = action.payload;

  let workplace;
  if (!data.id) {
    workplace = yield call(postRequest({ url: '/api/user-locations/' }), action);
  } else {
    workplace = yield call(putRequest({ url: `/api/user-locations/${data.id}/` }), action);
  }

  if (!workplace) {
    message.error('Save filed!');
    return;
  }

  if (logo) {
    if (logo.file) {
      const image = yield call(postRequest({ url: '/api/user-location-images/' }), {
        payload: {
          isFormData: true,
          data: {
            order: 0,
            location: workplace.id,
            image: logo.file
          },
          onUploadProgress: onUploading
        }
      });

      onUploading && onUploading();

      if (image) {
        workplace.images = [image];
      } else {
        message.error('Logo upload failed!');
      }
    } else if (workplace.images.length && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-location-images/${workplace.images[0].id}/` }));
      workplace.images = [];
    }
  }

  const { rc_workplaces } = yield select();
  let { workplaces } = rc_workplaces;
  if (!data.id) {
    workplaces = helper.addObj(workplaces, workplace);
  } else {
    workplaces = helper.updateObj(workplaces, workplace);
  }
  yield put({ type: C.RC_WORKPLACES_UPDATE, payload: { workplaces } });

  message.success('Workplace saved successfully!');
}

export default function* sagas() {
  yield takeLatest(C.RC_GET_WORKPLACES, getWorkplaces);
  yield takeLatest(C.RC_REMOVE_WORKPLACE, removeWorkplace);
  // yield takeLatest(C.RC_GET_WORKPLACE, getWorkplace);
  yield takeLatest(C.RC_SAVE_WORKPLACE, saveWorkplace);
}

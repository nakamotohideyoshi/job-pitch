import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { getRequest, postRequest, putRequest, deleteRequest, requestSuccess } from 'utils/request';

const getWorkplaces = getRequest({
  url: action => `/api/user-locations/?business=${action.payload.id}`
});

const removeWorkplace = deleteRequest({
  url: action => `/api/user-locations/${action.payload.id}/`,
  payloadOnSuccess: (_, action) => action.payload
});

function* getWorkplace(action) {
  const { rc_workplaces } = yield select();
  const { workplaces } = rc_workplaces || {};
  const { id, success } = action.payload;
  const workplace = helper.getItemByID(workplaces || [], id);
  if (workplace) {
    yield put({ type: requestSuccess(C.RC_GET_WORKPLACE), payload: workplace });
    success && success(workplace);
  } else {
    yield call(getRequest({ url: `/api/user-locations/${id}/` }), action);
  }
}

function* saveWorkplace(action) {
  const { data, logo, onSuccess, onFail, onUploading } = action.payload;

  let workplace;
  if (!data.id) {
    workplace = yield call(postRequest({ url: '/api/user-locations/' }), action);
  } else {
    workplace = yield call(putRequest({ url: `/api/user-locations/${data.id}/` }), action);
  }

  if (!workplace) {
    return onFail && onFail('Save filed');
  }

  if (logo) {
    if (logo.file) {
      const image = yield call(postRequest({ url: '/api/user-location-images/' }), {
        payload: {
          formData: true,
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
        onFail('Logo upload failed!');
      }
    } else if (workplace.images.length > 0 && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-location-images/${workplace.images[0].id}/` }));
      workplace.images = [];
    }
  }

  onSuccess && onSuccess(workplace);
}

export default function* sagas() {
  yield takeLatest(C.RC_GET_WORKPLACES, getWorkplaces);
  yield takeLatest(C.RC_REMOVE_WORKPLACE, removeWorkplace);
  yield takeLatest(C.RC_GET_WORKPLACE, getWorkplace);
  yield takeLatest(C.RC_SAVE_WORKPLACE, saveWorkplace);
}

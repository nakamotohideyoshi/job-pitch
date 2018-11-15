import { takeLatest, call, put } from 'redux-saga/effects';

import { request, getRequest, postRequest, deleteRequest } from 'utils/request';
import * as C from 'redux/constants';

export const getWorkplaces = getRequest({
  type: C.GET_WORKPLACES,
  url: `/api/user-locations/`
});

function* saveWorkplace({ payload }) {
  const { id, logo, onProgress, onSuccess, onFail } = payload;

  const workplace = yield call(
    request({
      method: id ? 'put' : 'post',
      url: id ? `/api/user-locations/${id}/` : '/api/user-locations/'
    }),
    { payload }
  );

  if (workplace === null) {
    onFail && onFail('There was an error saving the workplace');
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
          onUploadProgress: onProgress
        }
      });

      if (image === null) {
        onFail && onFail('There was an error uploading the logo');
      } else {
        workplace.images = [image];
      }
    } else if (workplace.images.length && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-location-images/${workplace.images[0].id}/` }));
      workplace.images = [];
    }
  }

  yield put({ type: C.UPDATE_WORKPLACE, payload: workplace });
  yield put({ type: C.UPDATE_BUSINESS, payload: workplace.business_data });

  onSuccess && onSuccess(workplace);
}

const removeWorkplace = deleteRequest({
  url: ({ id }) => `/api/user-locations/${id}/`
});

export default function* sagas() {
  yield takeLatest(C.REMOVE_WORKPLACE, removeWorkplace);
  yield takeLatest(C.SAVE_WORKPLACE, saveWorkplace);
}

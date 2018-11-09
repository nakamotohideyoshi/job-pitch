import { takeLatest, call, put } from 'redux-saga/effects';

import { request, getRequest, postRequest, deleteRequest } from 'utils/request';
import * as C from 'redux/constants';

export const getWorkplaces = getRequest({
  type: C.GET_WORKPLACES,
  url: `/api/user-locations/`
});

function* saveWorkplace(action) {
  const { data, logo, onProgress, onSuccess, onFail } = action.payload;

  const workplace = yield call(
    request({
      method: data.id ? 'put' : 'post',
      url: data.id ? `/api/user-locations/${data.id}/` : '/api/user-locations/'
    }),
    action
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

  yield put({ type: C.UPDATE_WORKPLACE, workplace });
  yield put({ type: C.UPDATE_BUSINESS, business: workplace.business_data });

  onSuccess && onSuccess(workplace);
}

const removeWorkplace = deleteRequest({
  url: ({ id }) => `/api/user-locations/${id}/`
});

export default function* sagas() {
  yield takeLatest(C.REMOVE_WORKPLACE, removeWorkplace);
  yield takeLatest(C.SAVE_WORKPLACE, saveWorkplace);
}

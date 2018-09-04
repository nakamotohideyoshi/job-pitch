import { takeLatest, call, put } from 'redux-saga/effects';

import { updateBusiness } from 'redux/recruiter/businesses/saga';
import request, { getRequest, postRequest, deleteRequest } from 'utils/request';
import * as C from 'redux/constants';

export const getWorkplaces = getRequest({
  type: C.RC_GET_WORKPLACES,
  url: `/api/user-locations/`
});

export function* updateWorkplace(workplace) {
  yield call(updateBusiness, workplace.business_data);
  yield put({ type: C.RC_UPDATE_WORKPLACE, workplace });
}

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

  yield call(updateWorkplace, workplace);

  onSuccess && onSuccess(workplace);
}

const removeWorkplace = deleteRequest({
  url: ({ id }) => `/api/user-locations/${id}/`
});

export default function* sagas() {
  yield takeLatest(C.RC_REMOVE_WORKPLACE, removeWorkplace);
  yield takeLatest(C.RC_SAVE_WORKPLACE, saveWorkplace);
}

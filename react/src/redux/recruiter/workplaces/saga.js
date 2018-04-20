import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import request, { getRequest, postRequest, deleteRequest } from 'utils/request';

export const getWorkplaces = getRequest({
  type: C.RC_GET_WORKPLACES,
  url: `/api/user-locations/`
});

const removeWorkplace = deleteRequest({
  url: ({ id }) => `/api/user-locations/${id}/`
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

  if (!workplace) {
    onFail && onFail('Removing is failed.');
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

      if (!image) {
        onFail && onFail('Uploading logo is failed.');
        onSuccess && onSuccess(workplace);
        return;
      }

      workplace.images = [image];
    } else if (workplace.images.length && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-location-images/${workplace.images[0].id}/` }));
      workplace.images = [];
    }
  }

  let { rc_workplaces: { workplaces } } = yield select();
  if (data.id) {
    workplaces = helper.updateObj(workplaces, workplace);
  } else {
    workplaces = helper.addObj(workplaces, workplace);
  }
  yield put({ type: C.RC_WORKPLACES_UPDATE, payload: { workplaces } });

  onSuccess && onSuccess(workplace);
}

export default function* sagas() {
  yield takeLatest(C.RC_GET_WORKPLACES, getWorkplaces);
  yield takeLatest(C.RC_REMOVE_WORKPLACE, removeWorkplace);
  yield takeLatest(C.RC_SAVE_WORKPLACE, saveWorkplace);
}

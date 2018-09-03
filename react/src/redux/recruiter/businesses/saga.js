import { takeLatest, call, put } from 'redux-saga/effects';

import request, { getRequest, postRequest, deleteRequest } from 'utils/request';
import * as C from 'redux/constants';

export const getBusinesses = getRequest({
  type: C.RC_GET_BUSINESSES,
  url: `/api/user-businesses/`
});

export function* updateBusiness(business) {
  yield put({ type: C.RC_UPDATE_BUSINESS, business });
}

function* saveBusiness({ payload }) {
  const { data, logo, onProgress, onSuccess, onFail } = payload;

  const business = yield call(
    request({
      method: data.id ? 'put' : 'post',
      url: data.id ? `/api/user-businesses/${data.id}/` : '/api/user-businesses/'
    }),
    { payload }
  );

  if (business === null) {
    onFail && onFail('There was an error saving the business');
    return;
  }

  if (logo) {
    if (logo.file) {
      const image = yield call(postRequest({ url: '/api/user-business-images/' }), {
        payload: {
          isFormData: true,
          data: {
            order: 0,
            business: business.id,
            image: logo.file
          },
          onUploadProgress: onProgress
        }
      });

      if (image === null) {
        onFail && onFail('There was an error uploading the logo');
      } else {
        business.images = [image];
      }
    } else if (business.images.length && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-business-images/${business.images[0].id}/` }));
      business.images = [];
    }
  }

  yield call(updateBusiness, business);

  onSuccess && onSuccess(business);
}

const removeBusiness = deleteRequest({
  url: ({ id }) => `/api/user-businesses/${id}/`
});

const purchase = postRequest({
  url: `/api/paypal/purchase/`
});

export default function* sagas() {
  yield takeLatest(C.RC_SAVE_BUSINESS, saveBusiness);
  yield takeLatest(C.RC_REMOVE_BUSINESS, removeBusiness);
  yield takeLatest(C.RC_PURCHASE, purchase);
}

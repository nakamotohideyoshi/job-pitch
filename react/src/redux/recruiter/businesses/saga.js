import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import request, { getRequest, postRequest, deleteRequest } from 'utils/request';

export const getBusinesses = getRequest({
  type: C.RC_GET_BUSINESSES,
  url: `/api/user-businesses/`
});

const removeBusiness = deleteRequest({
  url: ({ id }) => `/api/user-businesses/${id}/`
});

function* saveBusiness(action) {
  const { data, logo, onProgress, onSuccess, onFail } = action.payload;

  const business = yield call(
    request({
      method: data.id ? 'put' : 'post',
      url: data.id ? `/api/user-businesses/${data.id}/` : '/api/user-businesses/'
    }),
    action
  );

  if (!business) {
    onFail && onFail('Removing is failed.');
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

      if (!image) {
        onFail && onFail('Uploading logo is failed.');
        onSuccess && onSuccess(business);
        return;
      }

      business.images = [image];
    } else if (business.images.length && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-business-images/${business.images[0].id}/` }));
      business.images = [];
    }
  }

  let { rc_businesses: { businesses } } = yield select();
  if (data.id) {
    businesses = helper.updateObj(businesses, business);
  } else {
    businesses = helper.addObj(businesses, business);
  }
  yield put({ type: C.RC_BUSINESSES_UPDATE, payload: { businesses } });

  onSuccess && onSuccess(business);
}

const purchase = postRequest({
  url: `/api/paypal/purchase/`
});

export default function* sagas() {
  yield takeLatest(C.RC_GET_BUSINESSES, getBusinesses);
  yield takeLatest(C.RC_REMOVE_BUSINESS, removeBusiness);
  yield takeLatest(C.RC_SAVE_BUSINESS, saveBusiness);
  yield takeLatest(C.RC_PURCHASE, purchase);
}

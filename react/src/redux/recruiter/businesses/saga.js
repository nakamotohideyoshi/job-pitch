import { takeLatest, call, put, race, take, select } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';
import { getRequest, postRequest, putRequest, deleteRequest, requestSuccess, requestFail } from 'utils/request1';

function* getBusinesses(action) {
  yield race({
    result: call(getRequest({ url: `/api/user-businesses/` }), action),
    cancel: take(LOCATION_CHANGE)
  });
}

const removeBusiness = deleteRequest({
  url: action => `/api/user-businesses/${action.payload.id}/`,
  success: (_, { payload }) => payload,
  fail: (_, { payload }) => payload
});

// function* selectBusiness(action) {
//   let business = action.payload.business;
//   if (business) {
//     yield put({ type: requestSuccess(C.RC_SELECT_BUSINESS), payload: business });
//     return;
//   }

//   const { id, success } = action.payload;
//   const { rc_businesses } = yield select();
//   const { businesses } = rc_businesses || {};
//   business = helper.getItemByID(businesses || [], id);
//   if (business) {
//     yield put({ type: requestSuccess(C.RC_SELECT_BUSINESS), payload: business });
//     success && success(business);
//   } else {
//     yield call(getRequest({ url: `/api/user-businesses/${id}/` }), action);
//   }
// }

function* saveBusiness(action) {
  const { data: { id }, logo, onUploadProgress } = action.payload;

  let business;
  if (!id) {
    business = yield call(postRequest({ url: '/api/user-businesses/' }), action);
  } else {
    business = yield call(putRequest({ url: `/api/user-businesses/${id}/` }), action);
  }

  if (!business) {
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
          onUploadProgress
        }
      });

      onUploadProgress && onUploadProgress();

      if (image) {
        business.images = [image];
      } else {
        // onFail('Logo upload failed!');
      }
    } else if (business.images.length > 0 && !logo.exist) {
      yield call(deleteRequest({ url: `/api/user-business-images/${business.images[0].id}/` }));
      business.images = [];
    }
  }

  // const { rc_business } = yield select();
  // let {businesses} = rc_business;

  // yield put({type: C.RC_BUSINESSES_UPDATE, payload:})
}

const purchase = postRequest({ url: `/api/paypal/purchase/` });

export default function* sagas() {
  yield takeLatest(C.RC_GET_BUSINESSES, getBusinesses);
  yield takeLatest(C.RC_REMOVE_BUSINESS, removeBusiness);
  // yield takeLatest(C.RC_SELECT_BUSINESS, selectBusiness);
  yield takeLatest(C.RC_SAVE_BUSINESS, saveBusiness);
  yield takeLatest(C.RC_PURCHASE, purchase);
}

import * as C from './constants';

export function getBusinesses() {
  return { type: C.RC_GET_BUSINESSES };
}

export function removeBusiness(businessId) {
  return { type: C.RC_BUSINESS_REMOVE, businessId };
}

export function getBusiness(businessId) {
  return { type: C.RC_BUSINESS_GET, businessId };
}

export function saveBusiness(model, logo, onUploadProgress) {
  return { type: C.RC_BUSINESS_SAVE, model, logo, onUploadProgress };
}

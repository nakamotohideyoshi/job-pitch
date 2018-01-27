import * as C from './constants';

export function getWorkplaces(businessId) {
  return { type: C.RC_GET_WORKPLACES, businessId };
}

export function removeWorkplace(workplaceId) {
  return { type: C.RC_WORKPLACE_REMOVE, workplaceId };
}

export function getWorkplace(workplaceId) {
  return { type: C.RC_WORKPLACE_GET, workplaceId };
}

export function saveWorkplace(model, logo, onUploadProgress) {
  return { type: C.RC_WORKPLACE_SAVE, model, logo, onUploadProgress };
}

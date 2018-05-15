import { takeLatest } from 'redux-saga/effects';
import * as C from 'redux/constants';
import { weakRequest, getRequest, postRequest } from 'utils/request';

// function* useToken() {
//   const { rc_apps: { jobs, selectedJobId } } = yield select();
//   const job = helper.getItemByID(jobs, selectedJobId);
//   const business = job.location_data.business_data;
//   const updatedBusiness = {
//     ...business,
//     tokens: business.tokens - 1
//   };
//   job.location_data.business_data = updatedBusiness;
//   yield put({ type: requestSuccess(C.RC_SELECT_BUSINESS), payload: updatedBusiness });
// }

const findJobseekers = weakRequest(
  getRequest({
    url: '/api/job-seekers/'
  })
);

const connectJobseeker = weakRequest(
  postRequest({
    url: `/api/applications/`
  })
);

export default function* sagas() {
  yield takeLatest(C.RC_FIND_JOBSEEKERS, findJobseekers);
  yield takeLatest(C.RC_CONNECT_JOBSEEKER, connectJobseeker);
}

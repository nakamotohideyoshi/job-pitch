import { takeLatest, call, put } from 'redux-saga/effects';
import * as C from 'redux/constants';
import { getRequest, postRequest } from 'utils/request';

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

const findJobseekers = getRequest({
  url: '/api/job-seekers/'
});

function* connectJobseeker(action) {
  const result = yield call(postRequest({ url: `/api/applications/` }), action);
  if (result) {
    yield put({
      type: C.GET_APPLICATIONS,
      payload: {
        params: {
          job: action.payload.data.id
        }
      }
    });
  }
}

export default function* sagas() {
  yield takeLatest(C.RC_FIND_JOBSEEKERS, findJobseekers);
  yield takeLatest(C.RC_CONNECT_JOBSEEKER, connectJobseeker);
}

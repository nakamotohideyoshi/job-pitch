import { all } from 'redux-saga/effects';

import common from './common/saga';
import auth from './auth/saga';
import reset from './reset/saga';
import password from './password/saga';

import rc_find from './recruiter/find/saga';
import rc_businesses from './recruiter/businesses/saga';
import rc_workplaces from './recruiter/workplaces/saga';
import rc_jobs from './recruiter/jobs/saga';
import rc_jobseeker from './recruiter/jobseeker/saga';

import js_profile from './jobseeker/profile/saga';
import js_jobprofile from './jobseeker/jobprofile/saga';
import js_find from './jobseeker/find/saga';
import js_myapps from './jobseeker/myapps/saga';
import js_job from './jobseeker/job/saga';

import applications from './applications/saga';

export default function* rootSaga() {
  yield all([
    ...common,
    ...auth,
    ...reset,
    ...password,

    ...rc_find,
    ...rc_businesses,
    ...rc_workplaces,
    ...rc_jobs,
    ...rc_jobseeker,

    ...js_profile,
    ...js_jobprofile,
    ...js_find,
    ...js_myapps,
    ...js_job,

    ...applications
  ]);
}

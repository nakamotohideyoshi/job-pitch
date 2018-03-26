import { all } from 'redux-saga/effects';

import auth from './auth/saga';
import pitch from './jobseeker/pitch/saga';

import rc_apps from './recruiter/apps/saga';
import rc_businesses from './recruiter/businesses/saga';
import rc_workplaces from './recruiter/workplaces/saga';
import rc_jobs from './recruiter/jobs/saga';
import rc_jobseeker from './recruiter/jobseeker/saga';

import js_find from './jobseeker/find/saga';
import js_myapps from './jobseeker/myapps/saga';

import applications from './applications/saga';

import common from './common/saga';

export default function* rootSaga() {
  yield all([
    auth(),
    pitch(),

    js_find(),
    js_myapps(),

    ...common,

    rc_apps(),
    rc_businesses(),
    rc_workplaces(),
    rc_jobs(),
    ...rc_jobseeker,

    ...applications
  ]);
}

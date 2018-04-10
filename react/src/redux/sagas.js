import { all } from 'redux-saga/effects';

import auth from './auth/saga';
import applications from './applications/saga';

import pitch from './jobseeker/pitch/saga';

import rc_apps from './recruiter/apps/saga';
import rc_businesses from './recruiter/businesses/saga';
import rc_workplaces from './recruiter/workplaces/saga';
import rc_jobs from './recruiter/jobs/saga';

import js_find from './jobseeker/find/saga';

export default function* rootSaga() {
  yield all([auth(), applications(), pitch(), js_find(), rc_apps(), rc_businesses(), rc_workplaces(), rc_jobs()]);
}

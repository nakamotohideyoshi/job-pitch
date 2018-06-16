import { all } from 'redux-saga/effects';

import auth from './auth/saga';
import applications from './applications/saga';
import messages from './messages/saga';

import rc_find from './recruiter/find/saga';
import rc_businesses from './recruiter/businesses/saga';
import rc_workplaces from './recruiter/workplaces/saga';
import rc_jobs from './recruiter/jobs/saga';
import rc_users from './recruiter/users/saga';

import js_find from './jobseeker/find/saga';
import js_profile from './jobseeker/profile/saga';

export default function* rootSaga() {
  yield all([
    auth(),
    applications(),
    messages(),
    js_find(),
    js_profile(),
    rc_find(),
    rc_businesses(),
    rc_workplaces(),
    rc_jobs(),
    rc_users()
  ]);
}

import { all } from 'redux-saga/effects';

import auth from './auth/saga';
import businesses from './businesses/saga';
import workplaces from './workplaces/saga';

import applications from './applications/saga';

import rc_find from './recruiter/find/saga';
import rc_jobs from './recruiter/jobs/saga';
import rc_users from './recruiter/users/saga';

import js_find from './jobseeker/find/saga';
import js_profile from './jobseeker/profile/saga';

import hr_jobs from './hr/jobs/saga';
import hr_employees from './hr/employees/saga';

import em_employees from './employee/employees/saga';

export default function*() {
  yield all([
    auth(),
    businesses(),
    workplaces(),

    applications(),

    rc_find(),
    rc_jobs(),
    rc_users(),

    js_find(),
    js_profile(),

    hr_jobs(),
    hr_employees(),

    em_employees()
  ]);
}

import common from './common/reducer';
import auth from './auth/reducer';
import reset from './reset/reducer';
import password from './password/reducer';

import rc_find from './recruiter/find/reducer';
import rc_businesses from './recruiter/businesses/reducer';
import rc_workplaces from './recruiter/workplaces/reducer';
import rc_jobs from './recruiter/jobs/reducer';
import rc_jobseeker from './recruiter/jobseeker/reducer';

import js_find from './jobseeker/find/reducer';
import js_myapps from './jobseeker/myapps/reducer';
import js_profile from './jobseeker/profile/reducer';
import js_jobprofile from './jobseeker/jobprofile/reducer';
import js_job from './jobseeker/job/reducer';

import applications from './applications/reducer';

export default {
  common,
  auth,
  reset,
  password,

  rc_find,
  rc_businesses,
  rc_workplaces,
  rc_jobs,
  rc_jobseeker,

  js_find,
  js_myapps,
  js_profile,
  js_jobprofile,
  js_job,

  applications
};

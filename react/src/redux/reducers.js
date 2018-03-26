import auth from './auth';

import rc_apps from './recruiter/apps';
import rc_businesses from './recruiter/businesses';
import rc_workplaces from './recruiter/workplaces';
import rc_jobs from './recruiter/jobs';
import rc_jobseeker from './recruiter/jobseeker/reducer';

import js_find from './jobseeker/find';
import js_myapps from './jobseeker/myapps';

// import applications from './applications/reducer';

export default {
  auth,

  rc_apps,
  rc_businesses,
  rc_workplaces,
  rc_jobs,
  rc_jobseeker,

  js_find,
  js_myapps

  // applications
};

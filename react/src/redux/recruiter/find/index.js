import * as C from './constants';

export function getJobseekers(jobId) {
  return { type: C.RC_GET_JOBSEEKERS, jobId };
}

export function selectJobseeker(jobseeker) {
  return { type: C.RC_SELECT_JOBSEEKER, jobseeker };
}

export function connectJobseeker(jobseekerId, jobId) {
  return { type: C.RC_CONNECT_JOBSEEKER, jobseekerId, jobId };
}

export function removeJobseeker(jobseekerId) {
  return { type: C.RC_REMOVE_JOBSEEKER, jobseekerId };
}

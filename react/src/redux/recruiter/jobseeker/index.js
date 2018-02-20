import * as C from './constants';

export function getJobseeker(jobId, jobseekerId) {
  return { type: C.RC_GET_JOBSEEKER, jobId, jobseekerId };
}

import * as C from './constants';

export function getJobs() {
  return { type: C.JS_GET_JOBS };
}

export function applyJob(jobId) {
  return { type: C.JS_APPLY_JOB, jobId };
}

export function removeJob(jobId) {
  return { type: C.JS_REMOVE_JOB, jobId };
}

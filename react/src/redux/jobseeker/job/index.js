import * as C from './constants';

export function getJob(jobId) {
  return { type: C.JS_GET_JOB, jobId };
}

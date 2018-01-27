import * as C from './constants';

export function getJobs(workplaceId) {
  return { type: C.RC_GET_JOBS, workplaceId };
}

export function removeJob(jobId) {
  return { type: C.RC_JOB_REMOVE, jobId };
}

export function updateJob(model) {
  return { type: C.RC_JOB_UPDATE, model };
}

export function getJob(jobId) {
  return { type: C.RC_JOB_GET, jobId };
}

export function saveJob(model, logo, onUploadProgress) {
  return { type: C.RC_JOB_SAVE, model, logo, onUploadProgress };
}

export function selectJob(job) {
  return { type: C.RC_JOB_SELECT, job };
}

export function getJobsWithSeelctedJob(jobId) {
  return { type: C.RC_GET_JOBS_WITH_SELECTEDJOB, jobId };
}

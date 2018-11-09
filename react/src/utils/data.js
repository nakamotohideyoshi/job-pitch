export default {
  set userKey(key) {
    if (key) {
      localStorage.setItem('token', key);
    } else {
      localStorage.removeItem('token');
    }
  },
  get userKey() {
    return localStorage.getItem('token');
  },

  set jobStatuses(statuses) {
    this.JOB = {
      OPEN: statuses.filter(({ name }) => name === 'OPEN')[0].id,
      CLOSED: statuses.filter(({ name }) => name === 'CLOSED')[0].id
    };
  },

  set appStatuses(statuses) {
    this.APP = {
      CREATED: statuses.filter(({ name }) => name === 'CREATED')[0].id,
      ESTABLISHED: statuses.filter(({ name }) => name === 'ESTABLISHED')[0].id,
      DELETED: statuses.filter(({ name }) => name === 'DELETED')[0].id
    };
  },

  JOBSEEKER: 'JOB_SEEKER',
  RECRUITER: 'RECRUITER',
  get isJobseeker() {
    return this.userRole === this.JOBSEEKER;
  },
  get isRecruiter() {
    return this.userRole === this.RECRUITER;
  },

  searchRadius: [
    { id: 1, name: '1 mile' },
    { id: 2, name: '2 miles' },
    { id: 5, name: '5 miles' },
    { id: 10, name: '10 miles' },
    { id: 50, name: '50 miles' }
  ]
};

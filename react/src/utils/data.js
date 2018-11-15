import * as helper from 'utils/helper';

export default {
  // user key (token)
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

  // user role
  set roles(data) {
    this.ROLE = {
      RECRUITER: helper.getIdByName(data, 'RECRUITER'),
      JOBSEEKER: helper.getIdByName(data, 'JOB_SEEKER')
    };
  },

  set userRole(role) {
    helper.saveData('user_role', role);
  },
  get userRole() {
    return helper.loadData('user_role');
  },

  get isRecruiter() {
    return this.userRole && this.userRole === this.ROLE.RECRUITER;
  },
  get isJobseeker() {
    return this.userRole && this.userRole === this.ROLE.JOBSEEKER;
  },

  // tutorial
  set tutorial(step) {
    helper.saveData('tutorial', step);
  },
  get tutorial() {
    return helper.loadData('tutorial');
  },

  // job status
  set jobStatuses(data) {
    this.JOB = {
      OPEN: helper.getIdByName(data, 'OPEN'),
      CLOSED: helper.getIdByName(data, 'CLOSED')
    };
  },

  // application status
  set appStatuses(data) {
    this.APP = {
      CREATED: helper.getIdByName(data, 'CREATED'),
      ESTABLISHED: helper.getIdByName(data, 'ESTABLISHED'),
      DELETED: helper.getIdByName(data, 'DELETED')
    };
  },

  // search radius (job profile)
  searchRadius: [
    { id: 1, name: '1 mile' },
    { id: 2, name: '2 miles' },
    { id: 5, name: '5 miles' },
    { id: 10, name: '10 miles' },
    { id: 50, name: '50 miles' }
  ]
};

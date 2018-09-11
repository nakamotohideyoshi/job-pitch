import { createSelector } from 'reselect';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

const _getBusinesses = state => state.rc_businesses.businesses;
const _getWorkplaces = state => state.rc_workplaces.workplaces;
const _getJobs = state => state.rc_jobs.jobs;
const _getApplications = state => state.applications.applications;
const _getUsers = state => state.rc_users.users;

const getNewMsgs = messages => {
  let newMsgs = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.read) break;

    const userRole = helper.getNameByID('roles', msg.from_role);
    if (userRole === DATA.userRole) break;

    newMsgs++;
  }
  return newMsgs;
};

export const getAllNewMsgs = createSelector([_getApplications], applications => {
  let allNewMsgs = 0;
  applications.forEach(({ messages }) => {
    allNewMsgs += getNewMsgs(messages);
  });
  return allNewMsgs;
});

export const getBusinesses = createSelector([_getBusinesses], businesses => businesses);

export const getWorkplaces = createSelector(
  [_getWorkplaces, _getBusinesses],
  (workplaces, businesses) =>
    workplaces &&
    workplaces.map(workplace => {
      const business_data = businesses
        ? businesses.filter(({ id }) => id === workplace.business)[0]
        : workplace.business_data;
      return { ...workplace, business_data };
    })
);

export const getJobs = createSelector(
  [_getJobs, getWorkplaces],
  (jobs, workplaces) =>
    jobs &&
    jobs.map(job => {
      const workplace_data = workplaces ? workplaces.filter(({ id }) => id === job.workplace)[0] : job.workplace_data;
      return { ...job, workplace_data };
    })
);

export const getApplications = createSelector(
  [_getApplications, getJobs],
  (applications, jobs) =>
    applications &&
    applications.map(app => {
      let { messages, interviews, job } = app;

      const job_data = jobs ? jobs.filter(({ id }) => id === job)[0] : app.job_data;

      const newMsgs = getNewMsgs(messages);

      const interview = interviews.filter(({ status }) => status === 'PENDING' || status === 'ACCEPTED')[0];

      return { ...app, job_data, newMsgs, interview };
    })
);

export const getUsers = createSelector(
  [_getUsers, _getWorkplaces],
  (users, workplaces) =>
    users &&
    users.map(user => {
      var comment;
      if (user.locations.length) {
        comment = user.locations.map(id => helper.getItemByID(workplaces, id).name).join(', ');
      } else if (user.email === DATA.email) {
        comment = 'Administrator (Current User)';
      } else {
        comment = 'Administrator';
      }
      return { ...user, comment };
    })
);

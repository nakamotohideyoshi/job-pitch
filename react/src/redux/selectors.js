import { createSelector } from 'reselect';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

const getUser = state => state.auth.user;
const getBusinesses = state => state.businesses.businesses;
const getWorkplaces = state => state.workplaces.workplaces;
const getJobs = state => state.rc_jobs.jobs;
const getApplications = state => state.applications.applications;
const getUsers = state => state.rc_users.users;
const getHrJobs = state => state.hr_jobs.jobs;
const getHrEmployees = state => state.hr_employees.employees;
const getEmployees = state => state.em_employees.employees;

export const getHrBusinessesSelector = createSelector([getBusinesses], businesses =>
  businesses.filter(({ hr_access }) => hr_access)
);

export const getWorkplacesSelector = createSelector(
  [getWorkplaces, getBusinesses],
  (workplaces, businesses) =>
    workplaces &&
    workplaces.map(workplace => {
      const business_data = businesses
        ? businesses.filter(({ id }) => id === workplace.business)[0]
        : workplace.business_data;
      return { ...workplace, business_data };
    })
);

export const getJobsSelector = createSelector(
  [getJobs, getWorkplacesSelector],
  (jobs, workplaces) =>
    jobs &&
    jobs.map(job => {
      const workplace_data = workplaces ? workplaces.filter(({ id }) => id === job.workplace)[0] : job.workplace_data;
      return { ...job, workplace_data };
    })
);

export const getApplicationsSelector = createSelector(
  [getApplications, getJobsSelector],
  (applications, jobs) =>
    applications &&
    applications.map(app => {
      let { messages, interviews, job } = app;

      const job_data = jobs.filter(({ id }) => id === job)[0] || app.job_data;

      const newMsgs = getNewMsgs(messages);

      const interview = interviews.filter(({ status }) => status === 'PENDING' || status === 'ACCEPTED')[0];

      return { ...app, job_data, newMsgs, interview };
    })
);

const getNewMsgs = messages => {
  let newMsgs = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.read) break;

    const userRole = helper.getNameByID(DATA.roles, msg.from_role);
    if (userRole === DATA.userRole) break;

    newMsgs++;
  }
  return newMsgs;
};

export const getAllNewMsgsSelector = createSelector([getApplications], applications => {
  let allNewMsgs = 0;
  applications.forEach(({ messages }) => {
    allNewMsgs += getNewMsgs(messages);
  });
  return allNewMsgs;
});

export const getUsersSelelctor = createSelector(
  [getUsers, getWorkplaces],
  (users, workplaces) =>
    users &&
    users.map(user => {
      var comment;
      if (user.locations.length) {
        comment = user.locations.map(id => helper.getItemById(workplaces, id).name).join(', ');
      } else if (user.email === DATA.email) {
        comment = 'Administrator (Current User)';
      } else {
        comment = 'Administrator';
      }
      return { ...user, comment };
    })
);

export const getHrWorkplacesSelector = createSelector([getWorkplacesSelector], workplaces =>
  workplaces.filter(workplace => workplace.business_data.hr_access)
);

export const getHrJobsSelector = createSelector(
  [getJobs, getWorkplacesSelector],
  (jobs, workplaces) =>
    jobs &&
    jobs.map(job => {
      const workplace_data = helper.getItemById(workplaces, job.workplace);
      return { ...job, workplace_data };
    })
);

export const getHrEmployeesSelector = createSelector(
  [getEmployees, getJobs],
  (employees, jobs) =>
    employees &&
    employees.map(employee => {
      const job_data = helper.getItemById(jobs, employee.job);
      return { ...employee, job_data };
    })
);

export const getEmployeesSelector = createSelector(
  [getEmployees],
  (employees, businesses, workplaces) =>
    employees &&
    employees.map(employee => {
      // const { job } = employee;
      // const business_data = helper.getItemById(businesses, employee.business);
      // const location_data = helper.getItemById(workplaces, job.location);
      return { ...employee };
    })
);

export const enabledHRSelector = createSelector(
  [getHrBusinessesSelector],
  hrBusinesses => process.env.REACT_APP_HR && hrBusinesses.length
);

export const enabledEmployeeSelector = createSelector(
  [getUser],
  user => process.env.REACT_APP_EMPLOYEE && user.employees.length
);

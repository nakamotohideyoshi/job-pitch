import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Switch, Redirect, Route } from 'react-router-dom';
import { notification } from 'antd';

import DATA from 'utils/data';
import { enabledHRSelector, enabledEmployeeSelector } from 'redux/selectors';
import { Loading } from 'components';

import Layout from './Layout';

import Login from './auth/Login';
import Register from './auth/Register';
import Reset from './auth/Reset';
import SelectType from './auth/SelectType';

import RCApplications from './recruiter/Applications';
import AddApplication from './recruiter/Applications/AddApplication';
import RCJobseeker from './recruiter/Applications/Jobseeker';
import BusinessList from './recruiter/Jobs/BusinessList';
import BusinessEdit from './recruiter/Jobs/BusinessEdit';
import WorkplaceList from './recruiter/Jobs/WorkplaceList';
import WorkplaceEdit from './recruiter/Jobs/WorkplaceEdit';
import JobList from './recruiter/Jobs/JobList';
import JobEdit from './recruiter/Jobs/JobEdit';
import JobInterface from './recruiter/Jobs/JobInterface';
import RCMessages from './recruiter/Messages';
import RCSettings from './recruiter/Settings';
import UserList from './recruiter/Users/UserList';
import UserEdit from './recruiter/Users/UserEdit';

import FindJob from './jobseeker/FindJob';
import MyApplications from './jobseeker/MyApplications';
import JSInterviews from './jobseeker/Interviews';
import JSMessages from './jobseeker/Messages';
import JSSettings from './jobseeker/Settings';

import HrJobList from './hr/Jobs/JobList';
import HrJobEdit from './hr/Jobs/JobEdit';
import EmployeeList from './hr/Employees/EmployeeList';
import EmployeeEdit from './hr/Employees/EmployeeEdit';

import Employees from './employee/Employees';

import PublicWorkplace from './public/PublicWorkplace';
import PublicJob from './public/PublicJob';

import NotFound from './NotFound';

/* eslint-disable react/prop-types */

const AuthRoute = ({ component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (DATA.userKey) {
        return <Redirect to="/select" />;
      }

      return <Layout content={component} {...props} />;
    }}
  />
);

const RcRoute = connect(state => ({
  businesses: state.businesses.businesses
}))(({ component, businesses, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!DATA.userKey) {
        return <Redirect to={{ pathname: '/auth', state: { from: props.location } }} />;
      }

      if (!DATA.isRecruiter) {
        return <Redirect to="/select" />;
      }

      if (businesses.length === 0) {
        const path2 = rest.location.pathname.split('/')[2];
        if (path2 !== 'jobs') {
          return <Redirect to="/recruiter/jobs" />;
        }
      }

      return <Layout content={component} {...props} />;
    }}
  />
));

const JsRoute = connect(state => ({
  jobseeker: state.auth.jobseeker,
  jobprofile: state.auth.jobprofile
}))(({ component, jobseeker, jobprofile, addBannerAction, removeBannerAction, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!DATA.userKey) {
        return <Redirect to={{ pathname: '/auth', state: { from: props.location } }} />;
      }

      if (!DATA.isJobseeker) {
        return <Redirect to="/select" />;
      }

      const paths = rest.location.pathname.split('/');

      if (!jobseeker && (paths[2] !== 'settings' || paths[3] !== 'profile')) {
        return <Redirect to="/jobseeker/settings/profile" />;
      }

      if (!jobprofile && paths[2] !== 'settings') {
        return <Redirect to="/jobseeker/settings/jobprofile" />;
      }

      return <Layout content={component} {...props} />;
    }}
  />
));

const HrRoute = connect(state => ({
  enabledHR: enabledHRSelector(state)
}))(({ component, enabledHR, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!DATA.userKey) {
        return <Redirect to={{ pathname: '/auth', state: { from: props.location } }} />;
      }

      if (!enabledHR) {
        return <Redirect to="/select" />;
      }

      return <Layout content={component} {...props} />;
    }}
  />
));

const EmRoute = connect(state => ({
  enabledEmployee: enabledEmployeeSelector(state)
}))(({ component, enabledEmployee, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!DATA.userKey) {
        return <Redirect to={{ pathname: '/auth', state: { from: props.location } }} />;
      }

      if (!enabledEmployee) {
        return <Redirect to="/select" />;
      }

      return <Layout content={component} {...props} />;
    }}
  />
));

const Routers = ({ user }) => {
  if (DATA.userKey && !user) {
    return <Loading size="large" />;
  }

  return (
    <Switch>
      <Redirect exact from="/" to="/auth" />

      {/********* auth router ********/}

      <AuthRoute exact path="/auth" component={Login} />
      <AuthRoute exact path="/auth/register" component={Register} />
      <AuthRoute exact path="/auth/reset" component={Reset} />

      {/********* select router ********/}

      <Route
        exact
        path="/select"
        render={props => {
          if (!DATA.userKey) {
            return <Redirect to="/auth" />;
          }
          if (DATA.isJobseeker) {
            return <Redirect to="/jobseeker" />;
          }
          if (DATA.isRecruiter) {
            return <Redirect to="/recruiter" />;
          }
          return <Layout content={SelectType} {...props} />;
        }}
      />

      {/********* recruiter routers ********/}

      <Redirect exact from="/" to="/recruiter" />
      <Redirect exact from="/recruiter" to="/recruiter/applications/find" />
      <Redirect exact from="/recruiter/applications" to="/recruiter/applications/find" />
      <RcRoute exact path="/recruiter/applications/find" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/find/:jobId" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/find/:jobId/:jobseekerId" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/apps" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/apps/:jobId" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/add" component={AddApplication} />
      <RcRoute exact path="/recruiter/applications/conns" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/conns/:jobId" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/shortlist" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/shortlist/:jobId" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/offered" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/offered/:jobId" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/hired" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/hired/:jobId" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/interviews" component={RCApplications} />
      <RcRoute exact path="/recruiter/applications/interviews/:jobId" component={RCApplications} />
      <RcRoute exact path="/recruiter/apps/:jobId/:jobseekerId" component={RCJobseeker} />
      <Redirect exact from="/recruiter/jobs" to="/recruiter/jobs/business" />
      <RcRoute exact path="/recruiter/jobs/business" component={BusinessList} />
      <RcRoute exact path="/recruiter/jobs/business/add" component={BusinessEdit} />
      <RcRoute exact path="/recruiter/jobs/business/edit/:businessId" component={BusinessEdit} />
      <RcRoute exact path="/recruiter/jobs/workplace/:businessId" component={WorkplaceList} />
      <RcRoute exact path="/recruiter/jobs/workplace/add/:businessId" component={WorkplaceEdit} />
      <RcRoute exact path="/recruiter/jobs/workplace/edit/:workplaceId" component={WorkplaceEdit} />
      <RcRoute exact path="/recruiter/jobs/job/:workplaceId" component={JobList} />
      <RcRoute exact path="/recruiter/jobs/job/add/:workplaceId" component={JobEdit} />
      <RcRoute exact path="/recruiter/jobs/job/edit/:jobId" component={JobEdit} />
      <RcRoute exact path="/recruiter/jobs/job/view/:jobId" component={JobInterface} />
      <RcRoute exact path="/recruiter/users" component={UserList} />
      <RcRoute exact path="/recruiter/users/:businessId" component={UserList} />
      <RcRoute exact path="/recruiter/users/add/:businessId" component={UserEdit} />
      <RcRoute exact path="/recruiter/users/edit/:userId" component={UserEdit} />
      <RcRoute exact path="/recruiter/messages" component={RCMessages} />
      <RcRoute exact path="/recruiter/messages/:appId" component={RCMessages} />
      <Redirect exact from="/recruiter/settings" to="/recruiter/settings/credits" />
      <RcRoute exact path="/recruiter/settings/credits" component={RCSettings} />
      <Route
        exact
        path="/recruiter/settings/credits/purchase-success"
        render={({ history }) => {
          notification.success({
            message: 'Success',
            description: 'The payment is successful'
          });
          history.replace('/recruiter/settings/credits');
          return null;
        }}
      />
      <Route
        exact
        path="/recruiter/settings/credits/purchase-cancel"
        render={({ history }) => {
          notification.info({
            message: 'Cancel',
            description: 'The payment is cancelled'
          });
          history.replace('/recruiter/settings/credits');
          return null;
        }}
      />
      <Route
        exact
        path="/recruiter/settings/credits/purchase-error"
        render={({ history, location }) => {
          console.log(history, location, 9999);
          let error = (location.search || 'There was an error').replace('?error=', '');
          notification.error({
            message: 'Error',
            description: error
          });
          history.replace('/recruiter/settings/credits');
          return null;
        }}
      />
      <RcRoute exact path="/recruiter/settings/credits/:businessId" component={RCSettings} />
      <RcRoute exact path="/recruiter/settings/password" component={RCSettings} />

      {/********* jobseeker routers ********/}

      <Redirect exact from="/" to="/jobseeker" />
      <Redirect exact from="/jobseeker" to="/jobseeker/find" />
      <JsRoute exact path="/jobseeker/find" component={FindJob} />
      <JsRoute exact path="/jobseeker/applications" component={MyApplications} />
      <JsRoute exact path="/jobseeker/interviews" component={JSInterviews} />
      <JsRoute exact path="/jobseeker/messages" component={JSMessages} />
      <JsRoute exact path="/jobseeker/messages/:appId" component={JSMessages} />
      <Redirect exact from="/jobseeker/settings" to="/jobseeker/settings/profile" />
      <JsRoute exact path="/jobseeker/settings/profile" component={JSSettings} />
      <JsRoute exact path="/jobseeker/settings/record" component={JSSettings} />
      <JsRoute exact path="/jobseeker/settings/jobprofile" component={JSSettings} />
      <JsRoute exact path="/jobseeker/settings/password" component={JSSettings} />

      {/********* hr routers ********/}

      <Redirect exact from="/hr" to="/hr/jobs" />
      <HrRoute exact path="/hr/jobs" component={HrJobList} />
      <HrRoute exact path="/hr/jobs/add" component={HrJobEdit} />
      <HrRoute exact path="/hr/jobs/:jobId" component={HrJobEdit} />
      <HrRoute exact path="/hr/employees" component={EmployeeList} />
      <HrRoute exact path="/hr/employees/add" component={EmployeeEdit} />
      <HrRoute exact path="/hr/employees/:employeeId" component={EmployeeEdit} />

      {/********* employee routers ********/}

      <EmRoute exact path="/employee" component={Employees} />

      {/********* public routers ********/}

      <Route
        exact
        path="/public/locations/:workplaceId"
        render={props => <Layout content={PublicWorkplace} {...props} />}
      />

      <Route exact path="/public/jobs/:jobId" render={props => <Layout content={PublicJob} {...props} />} />

      <Route exact component={NotFound} />
    </Switch>
  );
};

export default withRouter(
  connect(state => ({
    user: state.auth.user
  }))(Routers)
);

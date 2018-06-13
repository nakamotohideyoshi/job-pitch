import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AuthRoute from 'containers/auth/Route';
import Login from 'containers/auth/Login';
import Register from 'containers/auth/Register';
import Reset from 'containers/auth/Reset';
import SelectType from 'containers/auth/SelectType';

import RCRoute from 'containers/recruiter/Route';
import RCApplications from 'containers/recruiter/Applications';
import RCJobseeker from 'containers/recruiter/Applications/Jobseeker';
import BusinessList from 'containers/recruiter/Jobs/BusinessList';
import BusinessEdit from 'containers/recruiter/Jobs/BusinessEdit';
import WorkplaceList from 'containers/recruiter/Jobs/WorkplaceList';
import WorkplaceEdit from 'containers/recruiter/Jobs/WorkplaceEdit';
import JobList from 'containers/recruiter/Jobs/JobList';
import JobEdit from 'containers/recruiter/Jobs/JobEdit';
import JobInterface from 'containers/recruiter/Jobs/JobInterface';
import RCMessages from 'containers/recruiter/Messages';
import RCSettings from 'containers/recruiter/Settings';

import BusinessListForUser from 'containers/recruiter/Users/BusinessListForUser';

import JSRoute from 'containers/jobseeker/Route';
import FindJob from 'containers/jobseeker/FindJob';
import JSApplications from 'containers/jobseeker/MyApplications';
import JSJob from 'containers/jobseeker/Job';
import JSPublicJob from 'containers/jobseeker/PublicJob';
import JSMessages from 'containers/jobseeker/Messages';
import JSSettings from 'containers/jobseeker/Settings';

import NotFound from 'containers/NotFound';

import Layout from 'containers/Layout';

export default props => {
  return (
    <Switch>
      <Redirect exact from="/" to="/auth" />
      <AuthRoute exact path="/auth" component={Login} />
      <AuthRoute exact path="/auth/register" component={Register} />
      <AuthRoute exact path="/auth/reset" component={Reset} />

      <AuthRoute exact path="/select" component={SelectType} />

      <Redirect exact from="/recruiter" to="/recruiter/applications/find" />
      <Redirect exact from="/recruiter/applications" to="/recruiter/applications/find" />
      <RCRoute exact path="/recruiter/applications/find" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/find/:jobId" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/find/:jobId/:jobseekerId" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/apps" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/apps/:jobId" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/conns" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/conns/:jobId" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/shortlist" component={RCApplications} />
      <RCRoute exact path="/recruiter/applications/shortlist/:jobId" component={RCApplications} />
      <RCRoute exact path="/recruiter/apps/:jobId/:jobseekerId" component={RCJobseeker} />

      <Redirect exact from="/recruiter/jobs" to="/recruiter/jobs/business" />
      <RCRoute exact path="/recruiter/jobs/business" component={BusinessList} />
      <RCRoute exact path="/recruiter/jobs/business/add" component={BusinessEdit} />
      <RCRoute exact path="/recruiter/jobs/business/edit/:businessId" component={BusinessEdit} />
      <RCRoute exact path="/recruiter/jobs/workplace/:businessId" component={WorkplaceList} />
      <RCRoute exact path="/recruiter/jobs/workplace/add/:businessId" component={WorkplaceEdit} />
      <RCRoute exact path="/recruiter/jobs/workplace/edit/:workplaceId" component={WorkplaceEdit} />
      <RCRoute exact path="/recruiter/jobs/job/:workplaceId" component={JobList} />
      <RCRoute exact path="/recruiter/jobs/job/add/:workplaceId" component={JobEdit} />
      <RCRoute exact path="/recruiter/jobs/job/edit/:jobId" component={JobEdit} />
      <RCRoute exact path="/recruiter/jobs/job/view/:jobId" component={JobInterface} />
      <RCRoute exact path="/recruiter/messages" component={RCMessages} />
      <RCRoute exact path="/recruiter/messages/:appId" component={RCMessages} />
      <Redirect exact from="/recruiter/settings" to="/recruiter/settings/credits" />
      <RCRoute exact path="/recruiter/settings/credits" component={RCSettings} />
      <RCRoute exact path="/recruiter/settings/credits/:businessId" component={RCSettings} />
      <RCRoute exact path="/recruiter/settings/password" component={RCSettings} />

      <Redirect exact from="/recruiter/users" to="/recruiter/users/business" />
      <RCRoute exact path="/recruiter/users/business" component={BusinessListForUser} />

      <Redirect exact from="/jobseeker" to="/jobseeker/find" />
      <JSRoute exact path="/jobseeker/find" component={FindJob} />
      <JSRoute exact path="/jobseeker/applications" component={JSApplications} />

      {props.auth === 'auth' ? (
        <Route exact path="/jobseeker/jobs/:jobId" render={props => <Layout component={JSPublicJob} {...props} />} />
      ) : (
        <JSRoute exact path="/jobseeker/jobs/:jobId" component={JSJob} />
      )}
      <JSRoute exact path="/jobseeker/jobs/:jobId" component={JSJob} />
      <JSRoute exact path="/jobseeker/messages" component={JSMessages} />
      <JSRoute exact path="/jobseeker/messages/:appId" component={JSMessages} />
      <Redirect exact from="/jobseeker/settings" to="/jobseeker/settings/profile" />
      <JSRoute exact path="/jobseeker/settings/profile" component={JSSettings} />
      <JSRoute exact path="/jobseeker/settings/record" component={JSSettings} />
      <JSRoute exact path="/jobseeker/settings/jobprofile" component={JSSettings} />
      <JSRoute exact path="/jobseeker/settings/password" component={JSSettings} />

      <Route component={NotFound} />
    </Switch>
  );
};

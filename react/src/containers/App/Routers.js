import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AuthRoute from 'containers/auth/Route';
import Login from 'containers/auth/Login';
import Register from 'containers/auth/Register';
import Reset from 'containers/auth/Reset';
import SelectType from 'containers/auth/SelectType';

import RCRoute from 'containers/recruiter/Route';
import FindTalent from 'containers/recruiter/Applications/FindTalent';
import MyApplications from 'containers/recruiter/Applications/MyApplications';
import MyConnections from 'containers/recruiter/Applications/MyConnections';
import MyShortlist from 'containers/recruiter/Applications/MyShortlist';

import RCJobs from 'containers/recruiter/Jobs';
import RCMessages from 'containers/recruiter/Messages';
import RCSettings from 'containers/recruiter/Settings';

import JSRoute from 'containers/jobseeker/Route';
import FindJob from 'containers/jobseeker/Find';
import JSJobDetail from 'containers/jobseeker/JobDetail';
import JSApplications from 'containers/jobseeker/Applications';
import JSAppDetail from 'containers/jobseeker/AppDetail';
import JSJobs from 'containers/jobseeker/Jobs';
import JSMessages from 'containers/jobseeker/Messages';
import JSSettings from 'containers/jobseeker/Settings';

import NotFound from 'containers/NotFound';

export default () => {
  return (
    <Switch>
      <Redirect exact from="/" to="/auth" />
      <AuthRoute exact path="/auth" component={Login} />
      <AuthRoute exact path="/auth/register" component={Register} />
      <AuthRoute exact path="/auth/reset" component={Reset} />

      <AuthRoute exact path="/select" component={SelectType} />

      <Redirect exact from="/recruiter" to="/recruiter/applications/find" />
      <Redirect exact from="/recruiter/applications" to="/recruiter/applications/find" />

      <RCRoute exact path="/recruiter/applications/find" component={FindTalent} />
      <RCRoute exact path="/recruiter/applications/find/:jobId" component={FindTalent} />
      <RCRoute exact path="/recruiter/applications/find/:jobId/:jobseekerId" component={FindTalent} />
      <RCRoute exact path="/recruiter/applications/apps" component={MyApplications} />
      <RCRoute exact path="/recruiter/applications/apps/:jobId" component={MyApplications} />
      <RCRoute exact path="/recruiter/applications/conns" component={MyConnections} />
      <RCRoute exact path="/recruiter/applications/conns/:jobId" component={MyConnections} />
      <RCRoute exact path="/recruiter/applications/shortlist" component={MyShortlist} />
      <RCRoute exact path="/recruiter/applications/shortlist/:jobId" component={MyShortlist} />
      {/* <RCRoute exact path="/recruiter/apps/:jobId/:jobseekerId" component={RCApplications} /> */}

      <Redirect exact from="/recruiter/jobs" to="/recruiter/jobs/business" />
      <RCRoute exact path="/recruiter/jobs/business" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/business/add" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/business/edit/:businessId" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/workplace/:businessId" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/workplace/add/:businessId" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/workplace/edit/:workplaceId" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/job/:workplaceId" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/job/add/:workplaceId" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/job/edit/:jobId" component={RCJobs} />
      <RCRoute exact path="/recruiter/jobs/job/view/:jobId" component={RCJobs} />
      <RCRoute exact path="/recruiter/messages" component={RCMessages} />
      <Redirect exact from="/recruiter/settings" to="/recruiter/settings/credits" />
      <RCRoute exact path="/recruiter/settings/credits" component={RCSettings} />
      <RCRoute exact path="/recruiter/settings/credits/:businessId" component={RCSettings} />
      <RCRoute exact path="/recruiter/settings/password" component={RCSettings} />

      <Redirect exact from="/jobseeker" to="/jobseeker/find" />
      <JSRoute exact path="/jobseeker/find" component={FindJob} />
      <JSRoute exact path="/jobseeker/find/:jobId" component={JSJobDetail} />
      <JSRoute exact path="/jobseeker/applications" component={JSApplications} />
      <JSRoute exact path="/jobseeker/applications/:appId" component={JSAppDetail} />
      <JSRoute exact path="/jobseeker/jobs/:jobId" component={JSJobs} />
      <JSRoute exact path="/jobseeker/messages" component={JSMessages} />
      <Redirect exact from="/jobseeker/settings" to="/jobseeker/settings/profile" />
      <JSRoute exact path="/jobseeker/settings/profile" component={JSSettings} />
      <JSRoute exact path="/jobseeker/settings/record" component={JSSettings} />
      <JSRoute exact path="/jobseeker/settings/jobprofile" component={JSSettings} />
      <JSRoute exact path="/jobseeker/settings/password" component={JSSettings} />

      <Route component={NotFound} />
    </Switch>
  );
};

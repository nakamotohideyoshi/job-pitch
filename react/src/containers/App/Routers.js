import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'containers/common/Home';
import Login from 'containers/common/Login';
import Register from 'containers/common/Register';
import Reset from 'containers/common/Reset';
import SelectType from 'containers/common/SelectType';
import Password from 'containers/common/Password';
import NotFound from 'containers/common/NotFound';

import Applications from 'containers/recruiter/Applications';
import Jobs from 'containers/recruiter/Jobs';
import Credits from 'containers/recruiter/Credits';
import RCMessages from 'containers/recruiter/RCMessages';

import FindJob from 'containers/jobseeker/FindJob';
import MyApplications from 'containers/jobseeker/MyApplications';
import Profile from 'containers/jobseeker/Profile';
import PitchRecord from 'containers/jobseeker/PitchRecord';
import JobProfile from 'containers/jobseeker/JobProfile';
import JSMessages from 'containers/jobseeker/JSMessages';

export default () => (
  <Switch>
    <Route exact path="/" component={Login} />
    <Route exact path="/auth" component={Login} />
    <Route exact path="/auth/register" component={Register} />
    <Route exact path="/auth/register/:type" component={Register} />
    <Route exact path="/auth/reset" component={Reset} />

    <Route exact path="/select" component={SelectType} />
    <Route exact path="/password" component={Password} />

    <Route path="/recruiter/applications" component={Applications} />
    <Route path="/recruiter/jobs" component={Jobs} />
    <Route exact path="/recruiter/credits" component={Credits} />
    <Route exact path="/recruiter/credits/:businessId" component={Credits} />
    <Route exact path="/recruiter/messages" component={RCMessages} />
    <Route exact path="/recruiter/messages/:appId" component={RCMessages} />

    <Route exact path="/jobseeker/find" component={FindJob} />
    <Route exact path="/jobseeker/applications" component={MyApplications} />
    <Route exact path="/jobseeker/profile" component={Profile} />
    <Route exact path="/jobseeker/record" component={PitchRecord} />
    <Route exact path="/jobseeker/jobprofile" component={JobProfile} />
    <Route exact path="/jobseeker/messages" component={JSMessages} />
    <Route exact path="/jobseeker/messages/:appId" component={JSMessages} />

    <Route component={NotFound} />
  </Switch>
);

import React from 'react';
import { IndexRoute, Route } from 'react-router';
import { MainLayout } from './components';
import {
  Home, About, Help, Terms, Privacy, ContactUs,
  Register, Login, Reset, SelectType, Password,
  Jobs, SelectJob, Applications, Credits, RMessages,
  MyApplications, FindJob, JobProfile, PitchRecord, Profile, JSMessages,
  NotFound
} from './containers';

export default () => (

  <Route path="/">

    <Route component={MainLayout}>
      <IndexRoute component={Home} />

      <Route path="resources">
        <Route path="about" component={About} />
        <Route path="help" component={Help} />
        <Route path="help/:type" component={Help} />
        <Route path="terms" component={Terms} />
        <Route path="privacy" component={Privacy} />
        <Route path="contactus" component={ContactUs} />
      </Route>

      <Route path="register" component={Register} />
      <Route path="register/:type" component={Register} />
      <Route path="login" component={Login} />
      <Route path="reset" component={Reset} />
      <Route path="select" component={SelectType} />
      <Route path="password" component={Password} />

      <Route path="recruiter">
        <Route path="jobs" component={Jobs} />
        <Route path="applications" component={SelectJob} />
        <Route path="applications/:jobid" component={Applications} />
        <Route path="credits" component={Credits} />
        <Route path="credits/:status" component={Credits} />
        <Route path="messages" component={RMessages} />
      </Route>

      <Route path="jobseeker">
        <Route path="find" component={FindJob} />
        <Route path="myapplications" component={MyApplications} />
        <Route path="jobprofile" component={JobProfile} />
        <Route path="record" component={PitchRecord} />
        <Route path="profile" component={Profile} />
        <Route path="messages" component={JSMessages} />
      </Route>

    </Route>

    <Route path="*" component={NotFound} status={4} />

  </Route>
);

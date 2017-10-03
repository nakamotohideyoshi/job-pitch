import React from 'react';
import { IndexRoute, Route } from 'react-router';
import { MainLayout } from './components';
import {
  Register, Login, Reset, Password,
  Home, About, Help, Terms, Privacy, ContactUs,
  SelectType, Messages,
  NotFound,
  Jobs, Applications1, Credits,
  MyApplications2, FindJob, JobProfile, PitchRecord, Profile
} from './containers';

export default () => (

  <Route path="/">

    <Route component={MainLayout}>

      <IndexRoute component={Home} />
      <Route path="login" component={Login} />
      <Route path="register" component={Register} />
      <Route path="register/:type" component={Register} />
      <Route path="reset" component={Reset} />

      <Route path="resources">
        <Route path="about" component={About} />
        <Route path="help" component={Help} />
        <Route path="help/:type" component={Help} />
        <Route path="terms" component={Terms} />
        <Route path="privacy" component={Privacy} />
        <Route path="contactus" component={ContactUs} />
      </Route>

      <Route path="select" component={SelectType} />
      <Route path="password" component={Password} />
      <Route path="messages" component={Messages} />

      <Route path="recruiter">
        <Route path="jobs" component={Jobs} />
        <Route path="applications" component={Applications1} />
        <Route path="credits" component={Credits} />
        <Route path="credits/:status" component={Credits} />
      </Route>

      <Route path="jobseeker">
        <Route path="find" component={FindJob} />
        <Route path="myapplications" component={MyApplications2} />
        <Route path="messages" component={Messages} />
        <Route path="jobprofile" component={JobProfile} />
        <Route path="record" component={PitchRecord} />
        <Route path="profile" component={Profile} />
      </Route>

    </Route>

    <Route path="*" component={NotFound} status={4} />

  </Route>
);

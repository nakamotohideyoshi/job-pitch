import React from 'react';
import { IndexRoute, Route } from 'react-router';

// eslint-disable-next-line import/no-dynamic-require
if (typeof System.import === 'undefined') System.import = module => Promise.resolve(require(module));

export default () => (

  <Route path="/">

    <Route getComponent={() => System.import('./components/layout/HomeLayout/HomeLayout')}>
      <IndexRoute getComponent={() => System.import('./containers/home/Home/Home')} />
      <Route path="how1" getComponent={() => System.import('./containers/home/How1/How1')} />
      <Route path="how2" getComponent={() => System.import('./containers/home/How2/How2')} />
      <Route path="about" getComponent={() => System.import('./containers/home/About/About')} />
      <Route path="terms" getComponent={() => System.import('./containers/home/Terms/Terms')} />
      <Route path="login" getComponent={() => System.import('./containers/home/Login/Login')} />
      <Route path="register" getComponent={() => System.import('./containers/home/Register/Register')} />
      <Route path="register/:type" getComponent={() => System.import('./containers/home/Register/Register')} />
      <Route path="reset" getComponent={() => System.import('./containers/home/Reset/Reset')} />
    </Route>

    <Route getComponent={() => System.import('./components/layout/MainLayout/MainLayout')}>
      <Route path="select" getComponent={() => System.import('./containers/common/SelectType/SelectType')} />
      <Route path="recruiter">
        <Route path="find" getComponent={() => System.import('./containers/recruiter/Find/Find')} />
        <Route path="applications" getComponent={() => System.import('./containers/recruiter/Apps/Apps')} />
        <Route path="connections" getComponent={() => System.import('./containers/recruiter/Apps/Apps')} />
        <Route path="shortlist" getComponent={() => System.import('./containers/recruiter/Apps/Apps')} />
        <Route path="messages" getComponent={() => System.import('./containers/common/Messages/Messages')} />
        <Route path="businesses" getComponent={() => System.import('./containers/recruiter/Businesses/Businesses')} />
        <Route path="credits/:result" getComponent={() => System.import('./containers/recruiter/Credits/Credits')} />
        <Route path="how" getComponent={() => System.import('./containers/recruiter/How/How')} />
      </Route>
      <Route path="jobseeker">
        <Route path="find" getComponent={() => System.import('./containers/jobseeker/Find/Find')} />
        <Route path="applications" getComponent={() => System.import('./containers/jobseeker/Apps/Apps')} />
        <Route path="messages" getComponent={() => System.import('./containers/common/Messages/Messages')} />
        <Route path="jobprofile" getComponent={() => System.import('./containers/jobseeker/JobProfile/JobProfile')} />
        <Route path="record" getComponent={() => System.import('./containers/jobseeker/PitchRecord/PitchRecord')} />
        <Route path="profile" getComponent={() => System.import('./containers/jobseeker/Profile/Profile')} />
        <Route path="how" getComponent={() => System.import('./containers/jobseeker/How/How')} />
      </Route>
      <Route path="password" getComponent={() => System.import('./containers/common/Password/Password')} />
      <Route path="main_about" getComponent={() => System.import('./containers/common/About/About')} />
      <Route path="main_terms" getComponent={() => System.import('./containers/common/Terms/Terms')} />
      <Route path="main_privacy" getComponent={() => System.import('./containers/common/Privacy/Privacy')} />
      <Route path="contactus" getComponent={() => System.import('./containers/common/ContactUs/ContactUs')} />
    </Route>

    <Route path="*" getComponent={() => System.import('./containers/common/NotFound/NotFound')} status={404} />

  </Route>
);

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import FindTalent from './FindTalent';
import MyApplications from './MyApplications';
import MyConnections from './MyConnections';
import MyShortlist from './MyShortlist';

const RCApplications = () => {
  return (
    <Switch>
      <Route exact path="/recruiter/applications/find" component={FindTalent} />
      <Route exact path="/recruiter/applications/find/:jobId" component={FindTalent} />
      <Route exact path="/recruiter/applications/find/:jobId/:jobseekerId" component={FindTalent} />
      <Route exact path="/recruiter/applications/apps" component={MyApplications} />
      <Route exact path="/recruiter/applications/apps/:jobId" component={MyApplications} />
      <Route exact path="/recruiter/applications/conns" component={MyConnections} />
      <Route exact path="/recruiter/applications/conns/:jobId" component={MyConnections} />
      <Route exact path="/recruiter/applications/shortlist" component={MyShortlist} />
      <Route exact path="/recruiter/applications/shortlist/:jobId" component={MyShortlist} />
      {/* <Route exact path="/recruiter/apps/:jobId/:jobseekerId" component={RCApplications} /> */}
    </Switch>
  );
};

export default RCApplications;

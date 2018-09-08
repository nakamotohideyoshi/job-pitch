import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { message } from 'antd';

import { getUserData } from 'redux/auth';

import { Loading } from 'components';
import Layout from 'containers/Layout';
import PublicWorkplace from 'containers/jobseeker/PublicWorkplace';
import PublicJob from 'containers/jobseeker/PublicJob';

import Routers from './Routers';

message.config({ top: 60 });
// notification.config({ top: 60 });

const App = ({ user, status, getUserData, location }) => {
  if (status !== 'auth' && !user) {
    getUserData();
    return <Loading size="large" />;
  }

  return (
    <Switch>
      <Route
        exact
        path="/jobseeker/locations/:workplaceId"
        render={props => <Layout component={PublicWorkplace} {...props} />}
      />
      {status !== 'jobseeker' && (
        <Route exact path="/jobseeker/jobs/:jobId" render={props => <Layout component={PublicJob} {...props} />} />
      )}

      <Routers status={status} location={location} />
    </Switch>
  );
};

export default withRouter(
  connect(
    state => ({
      user: state.auth.user,
      status: state.auth.status
    }),
    { getUserData }
  )(App)
);

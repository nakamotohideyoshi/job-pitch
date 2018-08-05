import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import Layout from 'containers/Layout';
import MainMenu from './MainMenu';

const RCRoute = ({ user, jobs, component, ...rest }) => (
  <Route
    {...rest}
    render={({ ...props }) => {
      const key = props.location.pathname.split('/')[2];

      if (jobs.length === 0 && (key === 'applications' || key === 'messages' || key === 'users')) {
        return <Redirect to="/recruiter/jobs" />;
      }
      return <Layout menu={MainMenu} component={component} {...props} />;
    }}
  />
);

export default connect(state => ({
  user: state.auth.user,
  jobs: state.rc_jobs.jobs
}))(RCRoute);

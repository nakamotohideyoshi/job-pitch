import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import Layout from 'containers/Layout';
import MainMenu from './MainMenu';

const JSRoute = ({ component, jobseeker, profile, ...rest }) => (
  <Route
    {...rest}
    render={({ ...props }) => {
      const key = props.location.pathname.split('/')[2];

      if (!profile && key !== 'settings') {
        return <Redirect to={`/jobseeker/settings/${!jobseeker ? 'profile' : 'jobprofile'}`} />;
      }

      return <Layout menu={MainMenu} component={component} {...props} />;
    }}
  />
);

export default connect(state => ({
  jobseeker: state.auth.jobseeker,
  profile: state.auth.profile
}))(JSRoute);

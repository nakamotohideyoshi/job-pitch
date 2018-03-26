import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import { Main } from 'components';
import MainMenu from './MainMenu';

const RCRoute = ({ user, component, ...rest }) => (
  <Route
    {...rest}
    render={({ ...props }) => {
      const key = props.location.pathname.split('/')[2];

      if (user.businesses.length === 0 && (key === 'applications' || key === 'messages')) {
        return <Redirect to="/recruiter/jobs" />;
      }

      return <Main menu={MainMenu} component={component} {...props} />;
    }}
  />
);

export default connect(state => ({
  user: state.auth.user
}))(RCRoute);

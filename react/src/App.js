import React from 'react';
import { connect } from 'react-redux';
import { Switch, withRouter } from 'react-router-dom';
import { MJPRouters, getUserDataAction, setStatusAction, Loading } from 'mjp-react-core';

/* eslint-disable react/prop-types */
const App = props => {
  const { status, user } = props;

  if (!user && status !== 'auth') {
    // load user data
    props.getUserDataAction();
    return <Loading size="large" />;
  }

  if (user && status === 'auth') {
    // set logged in status
    props.setStatusAction('select');
  }

  let recruitRouters;
  if (process.env.REACT_APP_RECRUIT && user) {
    recruitRouters = require('mjp-react-recruit').Routers(props);
    if (!recruitRouters) {
      return <Loading size="large" />;
    }
  }

  let hrRouters;
  if (process.env.REACT_APP_HR && user && (user.businesses || []).length) {
    hrRouters = require('mjp-react-hr').Routers(props);
    if (!hrRouters) {
      return <Loading size="large" />;
    }
  }

  let employeeRouters;
  if (process.env.REACT_APP_EMPLOYEE && user && (user.employees || []).length) {
    employeeRouters = require('mjp-react-employee').Routers(props);
    if (!employeeRouters) {
      return <Loading size="large" />;
    }
  }

  return (
    <Switch>
      {recruitRouters}
      {hrRouters}
      {employeeRouters}
      {MJPRouters(props)}
    </Switch>
  );
};

export default withRouter(
  connect(
    state => {
      const { user, status } = state.mjp;
      return { user, status };
    },
    {
      getUserDataAction,
      setStatusAction
    }
  )(App)
);

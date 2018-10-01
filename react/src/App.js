import React from 'react';
import { connect } from 'react-redux';
import { Switch, withRouter } from 'react-router-dom';
import { MJPRouters, getUserDataAction, setStatusAction, Loading } from 'mjp-react-core';
import { RecruitRouters } from 'mjp-react-recruit';

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

  let recruitRouters = RecruitRouters(props);
  if (!recruitRouters) {
    return <Loading size="large" />;
  }

  return (
    <Switch>
      {recruitRouters}
      {status === 'auth' && MJPRouters(props)}
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

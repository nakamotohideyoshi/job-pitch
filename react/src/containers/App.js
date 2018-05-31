import React from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { message, notification } from 'antd';

import { Loading } from 'components';

import { getUserData } from 'redux/auth';
import Routers from './routers';

message.config({ top: 60 });
notification.config({ top: 60 });

const App = ({ location, status, user, getUserData }) => {
  if (status !== 'auth' && !user) {
    getUserData();
    return <Loading size="large" />;
  }

  const { pathname, search } = location;
  const urlStatus = pathname.split('/')[1];
  if (pathname.indexOf('/jobseeker/jobs/') !== 0) {
    if (urlStatus !== status) {
      let redirect;
      if (urlStatus !== '' && status === 'auth') {
        redirect = `/auth?redirect=${pathname}${search}`;
      } else if (urlStatus === 'auth' && status !== 'auth') {
        redirect = `/select${search}`;
      } else if (urlStatus === 'select' && status !== 'select') {
        redirect = search.split('redirect=')[1];
      }
      return <Redirect to={redirect || `/${status}`} />;
    }
  }
  return <Routers auth={status} />;
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

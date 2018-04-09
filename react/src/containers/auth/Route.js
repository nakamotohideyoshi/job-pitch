import React from 'react';
import { Route } from 'react-router-dom';

import Layout from 'containers/Layout';

const AuthRoute = ({ component, ...rest }) => (
  <Route {...rest} render={props => <Layout component={component} {...props} />} />
);

export default AuthRoute;

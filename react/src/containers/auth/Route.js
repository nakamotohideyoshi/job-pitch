import React from 'react';
import { Route } from 'react-router-dom';

import { Main } from 'components';

const AuthRoute = ({ component, ...rest }) => (
  <Route {...rest} render={props => <Main component={component} {...props} />} />
);

export default AuthRoute;

import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import { getBusinesses } from 'redux/selectors';
import * as helper from 'utils/helper';

import Layout from 'containers/Layout';
import MainMenu from './MainMenu';

const RCRoute = ({ businesses, component, ...rest }) => (
  <Route
    {...rest}
    render={({ ...props }) => {
      const key = props.location.pathname.split('/')[2];

      const apply = helper.loadData('apply');
      if (apply) {
        helper.saveData('apply');
        return <Redirect to={`/jobseeker/jobs/${apply}`} />;
      }

      if (businesses.length === 0 && (key === 'applications' || key === 'messages' || key === 'users')) {
        return <Redirect to="/recruiter/jobs" />;
      }
      return <Layout menu={MainMenu} component={component} {...props} />;
    }}
  />
);

export default connect(state => ({
  businesses: getBusinesses(state)
}))(RCRoute);

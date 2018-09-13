import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, Link } from 'react-router-dom';

import { addBanner, removeBanner } from 'redux/common';
import Layout from 'containers/Layout';
import MainMenu from './MainMenu';

const JSRoute = ({ component, jobseeker, profile, addBanner, removeBanner, ...rest }) => (
  <Route
    {...rest}
    render={({ ...props }) => {
      const key = props.location.pathname.split('/')[2];

      if (!profile && key !== 'settings') {
        return <Redirect to={`/jobseeker/settings/${!jobseeker ? 'profile' : 'jobprofile'}`} />;
      }

      if (jobseeker && !jobseeker.active) {
        const isProfilePage = rest.location.pathname.indexOf('/jobseeker/settings/profile') === 0;
        addBanner({
          id: 'active',
          type: 'warning',
          message: (
            <span>
              Your profile is not active!
              {` `}
              {!isProfilePage && <Link to="/jobseeker/settings/profile">Activate</Link>}
            </span>
          )
        });
      } else {
        removeBanner('active');
      }

      return (
        <Layout
          menu={MainMenu}
          content={component}
          shareUrl="https://www.myjobpitch.com/candidates/"
          helpUrl="https://www.myjobpitch.com/jobseeker/"
          {...props}
        />
      );
    }}
  />
);

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    profile: state.js_profile.profile
  }),
  {
    addBanner,
    removeBanner
  }
)(JSRoute);

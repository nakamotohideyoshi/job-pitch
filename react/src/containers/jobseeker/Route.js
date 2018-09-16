import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, Link } from 'react-router-dom';

import { addBanner, removeBanner } from 'redux/common';
import * as helper from 'utils/helper';

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

      const isProfilePage = rest.location.pathname.indexOf('/jobseeker/settings/profile') === 0;

      if (jobseeker && !jobseeker.active) {
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

      if (jobseeker && (!jobseeker.profile_thumb && !helper.getPitch(jobseeker))) {
        addBanner({
          id: 'photo_pitch',
          type: 'warning',
          message: (
            <span>
              You cannot yet be found by potential employers until you complete your profile photo or job pitch
              {` `}
              {!isProfilePage && <Link to="/jobseeker/settings/profile">edit profile</Link>}
            </span>
          )
        });
      } else {
        removeBanner('photo_pitch');
      }

      return (
        <Layout
          menu={MainMenu}
          content={component}
          shareUrl="https://www.myjobpitch.com/candidates/"
          helpUrl="https://www.myjobpitch.com/jobseeker/"
          avatar={(jobseeker || {}).profile_thumb}
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

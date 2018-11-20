import React from 'react';

import DATA from 'utils/data';
import { Icons } from 'components';
import logoImage from 'assets/logo.png';
import FooterLayout from './Footer.styled';

/* eslint-disable react/prop-types */
const NewTabLink = ({ url, label, icon: Icon }) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {Icon && <Icon size="lg" />}
    {label}
  </a>
);

export default () => {
  let helpUrl = 'https://www.myjobpitch.com/';
  if (DATA.isJobseeker) {
    helpUrl = 'https://www.myjobpitch.com/candidates/';
  } else if (DATA.isRecruiter) {
    helpUrl = 'https://www.myjobpitch.com/recruiters/';
  }

  return (
    <FooterLayout>
      <div className="container">
        <div className="menus">
          <NewTabLink url={helpUrl} label="How it works" />
          <NewTabLink url="https://www.myjobpitch.com/about/terms/" label="Terms & Conditions" />
          <NewTabLink url="https://www.myjobpitch.com/about/privacy-policy/" label="Privacy Policy" />
          <NewTabLink url="https://www.myjobpitch.com/contact/" label="Contact Us" />
        </div>

        <div className="follow">
          <NewTabLink url="https://www.facebook.com/myjobpitch/" icon={Icons.FacebookF} />
          <NewTabLink url="https://twitter.com/myjobpitch/" icon={Icons.Twitter} />
          <NewTabLink url="https://www.linkedin.com/company/my-job-pitch/" icon={Icons.LinkedinIn} />
        </div>

        <div className="company">
          <img src={logoImage} alt="" />© 2017 Myjobpitch Ltd ({process.env.REACT_APP_VERSION})
        </div>
      </div>
    </FooterLayout>
  );
};

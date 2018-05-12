import React from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';

import { VERSION } from 'const';
import media from 'utils/mediaquery';

import { Icons } from 'components';
import logoImage from 'assets/logo.png';

const Footer = styled(Layout.Footer)`
  text-align: center;
  ${media.tablet`padding: 25px 0;`};

  a {
    display: inline-block;
    color: #999999;
    cursor: pointer;

    &:hover {
      color: #fff !important;
    }
  }

  .menus a {
    margin: 5px 15px;
    &:hover {
      text-decoration: underline !important;
    }
  }

  .follow a {
    margin: 15px 10px 0 10px;
  }

  .company {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    color: #999999;

    img {
      width: 25px;
      margin-right: 15px;
    }

    span {
      margin-left: 15px;
    }
  }
`;

const SocialLink = ({ url, icon: Icon }) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {Icon && <Icon size="lg" />}
  </a>
);

const Link = ({ url, label }) => (
  <a href={url} rel="noopener noreferrer">
    {label}
  </a>
);

export default ({ helpUrl }) => (
  <Footer>
    <div className="container">
      <div className="menus">
        <Link url="https://www.myjobpitch.com/about/" label="About" />
        <Link url={helpUrl} label="How it works" />
        <Link url="https://www.myjobpitch.com/about/terms/" label="Terms & Conditions" />
        <Link url="https://www.myjobpitch.com/about/privacy-policy/" label="Privacy Policy" />
        <Link url="https://www.myjobpitch.com/contact/" label="Contact Us" />
      </div>

      <div className="follow">
        <SocialLink url="https://www.facebook.com/myjobpitchapp/" icon={Icons.Facebook} />
        <SocialLink url="https://twitter.com/myjobpitch/" icon={Icons.Twitter} />
        <SocialLink url="https://www.linkedin.com/company/my-job-pitch/" icon={Icons.Linkedin} />
      </div>

      <div className="company">
        <img src={logoImage} alt="" />
        © 2017 Myjobpitch Ltd
        <span>({VERSION})</span>
      </div>
    </div>
  </Footer>
);

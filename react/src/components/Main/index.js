import React, { Fragment } from 'react';
import { Layout } from 'antd';
import Responsive from 'react-responsive';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faBars from '@fortawesome/fontawesome-free-solid/faBars';
import faFacebookF from '@fortawesome/fontawesome-free-brands/faFacebookF';
import faTwitter from '@fortawesome/fontawesome-free-brands/faTwitter';
import faLinkedinIn from '@fortawesome/fontawesome-free-brands/faLinkedinIn';

import { Container } from 'components';

import { VERSION } from 'const';

import UserMenu from './UserMenu';
import PopoverMenu from './PopoverMenu';
import LayoutWrapper from './Wrapper';

import titleImage from 'assets/title.png';
import logoImage from 'assets/logo.png';

const { Header, Content, Footer } = Layout;

const HELP_URLS = {
  auth: 'https://www.myjobpitch.com/what-is-my-job-pitch/',
  select: 'https://www.myjobpitch.com/what-is-my-job-pitch/',
  recruiter: 'https://www.myjobpitch.com/recruiters/',
  jobseeker: 'https://www.myjobpitch.com/jobseeker/'
};

const SocialLink = ({ url, icon }) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {icon && <FontAwesomeIcon icon={icon} size="lg" />}
  </a>
);

const Link = ({ url, label }) => (
  <a href={url} rel="noopener noreferrer">
    {label}
  </a>
);

class Main extends React.Component {
  render() {
    const { menu: Menu, component: Component, ...rest } = this.props;
    const status = this.props.location.pathname.split('/')[1];

    return (
      <LayoutWrapper>
        <Header className="shadow1">
          <Container>
            {Menu && (
              <Responsive maxWidth={767}>
                <PopoverMenu float="left" icon={faBars} menu={Menu} />
              </Responsive>
            )}

            <div className="title-logo">
              <img src={titleImage} alt="" />
            </div>

            {Menu && (
              <Fragment>
                <Responsive minWidth={768}>
                  <Menu theme="dark" mode="horizontal" />
                </Responsive>
                <UserMenu />
              </Fragment>
            )}
          </Container>
        </Header>

        <Content>
          <Component {...rest} />
        </Content>

        <Footer>
          <Container>
            <div className="menus">
              <Link url="https://www.myjobpitch.com/about/" label="About" />
              <Link url={HELP_URLS[status]} label="How it works" />
              <Link url="https://www.myjobpitch.com/about/terms/" label="Terms & Conditions" />
              <Link url="https://www.myjobpitch.com/about/privacy-policy/" label="Privacy Policy" />
              <Link url="https://www.myjobpitch.com/contact/" label="Contact Us" />
            </div>

            <div className="follow">
              <SocialLink url="https://www.facebook.com/" icon={faFacebookF} />
              <SocialLink url="https://www.twitter.com/" icon={faTwitter} />
              <SocialLink url="https://www.linkedin.com/" icon={faLinkedinIn} />
            </div>

            <div className="company">
              <img src={logoImage} alt="" />
              © 2017 Myjobpitch Ltd
              <span>({VERSION})</span>
            </div>
          </Container>
        </Footer>
      </LayoutWrapper>
    );
  }
}

export default Main;

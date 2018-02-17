import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Container } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFacebookF from '@fortawesome/fontawesome-free-brands/faFacebookF';
import faTwitter from '@fortawesome/fontawesome-free-brands/faTwitter';
import faLinkedinIn from '@fortawesome/fontawesome-free-brands/faLinkedinIn';

import { confirm } from 'redux/common';
import { VERSION } from 'const';
import logoImage from 'assets/logo.png';
import Wrapper from './Wrapper';

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

class Footer extends React.Component {
  render() {
    const { loginState } = this.props;

    return (
      <Wrapper>
        <Container>
          <div className="menu">
            <Link url="https://www.myjobpitch.com/about/" label="About" />
            {loginState === 'none' && (
              <Link url="https://www.myjobpitch.com/what-is-my-job-pitch/" label="How it works" />
            )}
            {loginState === 'recruiter' && <Link url="https://www.myjobpitch.com/recruiters/" label="How it works" />}
            {loginState === 'jobseeker' && <Link url="https://www.myjobpitch.com/jobseeker/" label="How it works" />}
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
      </Wrapper>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      loginState: state.auth.loginState
    }),
    {}
  )(Footer)
);

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Container } from 'reactstrap';

import { confirm } from 'redux/common';
import { VERSION } from 'const';
import * as helper from 'utils/helper';
import logoImage from 'assets/logo.png';
import Wrapper from './Wrapper';

const SocialLink = ({ url, icon }) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    <i className={`fa ${icon} fa-lg`} />
  </a>
);

class Footer extends React.Component {
  handleClickMenu = to => {
    helper.routePush(to, this.props);
  };

  render() {
    return (
      <Wrapper>
        <Container>
          <div className="menu">
            <a onClick={() => this.handleClickMenu('/resources/about')}>About</a>
            <a onClick={() => this.handleClickMenu('/resources/help')}>How it works</a>
            <a onClick={() => this.handleClickMenu('/resources/terms')}>Terms & Conditions</a>
            <a onClick={() => this.handleClickMenu('/resources/privacy')}>Privacy Policy</a>
            <a onClick={() => this.handleClickMenu('/resources/contactus')}>Contact Us</a>
          </div>

          <div className="follow">
            <SocialLink url="https://www.facebook.com/" icon="fa-facebook" />
            <SocialLink url="https://www.twitter.com/" icon="fa-twitter" />
            <SocialLink url="https://www.linkedin.com/" icon="fa-linkedin" />
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

export default withRouter(connect(() => ({}), { confirm })(Footer));

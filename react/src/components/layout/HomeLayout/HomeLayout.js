import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cookie from 'js-cookie';
import { Link, browserHistory } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Col from 'react-bootstrap/lib/Col';
import NotificationSystem from 'react-notification-system';
import { Loading } from 'components';
import * as utils from 'helpers/utils';
import * as authActions from 'redux/modules/auth';
import styles from './HomeLayout.scss';

const VERSION = 'v 0.9.7';

const titleImage = require('assets/title.png');
const logoImage = require('assets/logo.png');

@connect(
  () => ({}),
  { ...authActions }
)
export default class HomeLayout extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount() {
    this.preprocess().then(() => {
      this.setState({
        loading: false,
      });
    }).catch(() => {});
  }

  /* check user */

  preprocess = () => {
    const token = cookie.get(__DEVELOPMENT__ ? 'token' : 'csrftoken');
    if (!token) {
      return Promise.resolve();
    }
    browserHistory.push('/select');
    return Promise.reject();
  }

  render() {
    if (this.state.loading) {
      return <Loading />;
    }

    const { location, children } = this.props;
    const { pathname } = location;
    return (
      <div className={styles.root}>
        <Navbar inverse fixedTop collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">
                <img src={titleImage} alt="" />
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav>
              <NavDropdown
                id="1"
                title="How it works"
                className={pathname === '/how1' || pathname === '/how2' ? 'active' : ''}
              >
                <LinkContainer to="/how1">
                  <MenuItem>Recruiter</MenuItem>
                </LinkContainer>
                <LinkContainer to="/how2">
                  <MenuItem>JobSeeker</MenuItem>
                </LinkContainer>
              </NavDropdown>

              <LinkContainer to="/about">
                <NavItem>About</NavItem>
              </LinkContainer>
              <LinkContainer to="/terms">
                <NavItem>Terms & Conditions</NavItem>
              </LinkContainer>
            </Nav>

            <Nav pullRight>
              <LinkContainer to="/login">
                <NavItem>Login</NavItem>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className={styles.content}>
          {children}
        </div>

        <footer>
          <div className="container">
            <Col sm={4}>
              <Link to="/"><img src={logoImage} alt="" /></Link>
              <div>@ 2017 Sclabs Ltd</div>
            </Col>
            <Col sm={4}>
              <h4>CONTACT</h4>
              <div><i className="fa fa-map-marker" />London, Edinburgh</div>
              <div>
                <Link href="mailto:support@myjobpitch.com"><i className="fa fa-envelope" />support@myjobpitch.com</Link>
              </div>
            </Col>
            <Col sm={4}>
              <h4>FOLLOW US</h4>
              <Link href="https://www.facebook.com/"><i className="fa fa-twitter fa-lg" /></Link>
              <Link href="https://twitter.com/"><i className="fa fa-facebook fa-lg" /></Link>
              <Link href="https://www.linkedin.com/"><i className="fa fa-linkedin fa-lg" /></Link>
              <div>{VERSION}</div>
            </Col>
          </div>
        </footer>

        <NotificationSystem ref={node => utils.setNotifSystem(node)} />

      </div>
    );
  }
}

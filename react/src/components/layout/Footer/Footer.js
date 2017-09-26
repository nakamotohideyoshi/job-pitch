import React, { Component } from 'react';
import { Link } from 'react-router';
import { VERSION } from 'const';

import styles from './Footer.scss';

const logoImage = require('assets/logo.png');

export default class Footer extends Component {

  render() {
    return (
      <footer>
        <div className="container">
          <div className={styles.menu}>
            <Link to="/resources/about">About</Link>
            <Link to="/resources/help">Help</Link>
            <Link to="/resources/terms">Terms & Conditions</Link>
            <Link to="/resources/privacy">Privacy Policy</Link>
            <Link to="/resources/contactus">Contact Us</Link>
          </div>

          <div className={styles.follow}>
            <Link href="https://www.facebook.com/"><i className="fa fa-twitter fa-lg" /></Link>
            <Link href="https://twitter.com/"><i className="fa fa-facebook fa-lg" /></Link>
            <Link href="https://www.linkedin.com/"><i className="fa fa-linkedin fa-lg" /></Link>
          </div>

          <div className={styles.company}>
            <img src={logoImage} alt="" />
            @ 2017 Sclabs Ltd
            <span>({ VERSION })</span>
          </div>

        </div>
      </footer>
    );
  }
}

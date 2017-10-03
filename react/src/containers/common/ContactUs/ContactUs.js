import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import { Map } from 'components';
import styles from './ContactUs.scss';

const position = {
  lat: 51.5139057,
  lng: -0.1250237
};

export default class ContactUs extends Component {
  render() {
    return (
      <div className={styles.root}>
        <Helmet title="Contact Us" />

        <div className="container">
          <div className="pageHeader">
            <h3>Contact Us</h3>
          </div>

          <div className="board">
            <div className={styles.map}>
              <Map
                defaultCenter={position}
                marker={position}
              />
            </div>

            <div>
              <h5>{'Email: '}</h5>
              <p>
                <Link href="mailto:support@myjobpitch.com">support@myjobpitch.com</Link>
              </p>
              <h5>Mail Address:</h5>
              <p>
                71-75 Shelton Street Covent Garden London WC2H 9JQ
              </p>
            </div>

          </div>

        </div>
      </div>
    );
  }
}

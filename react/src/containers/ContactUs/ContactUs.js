import React, { Component } from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

export default class ContactUs extends Component {
  render() {
    return (
      <div>
        <Helmet title="Contact Us" />
        <div className="pageHeader">
          <h1>Contact Us</h1>
        </div>
        <div className="board">
          <b>{'Email: '}</b>
          <Link href="mailto:support@myjobpitch.com">support@myjobpitch.com</Link>
          <br /><br />
          <b>Mail Address:</b>
          <p>
            71-75 Shelton Street<br />
            Covent Garden<br />
            London<br />
            WC2H 9JQ
          </p>
        </div>
      </div>
    );
  }
}

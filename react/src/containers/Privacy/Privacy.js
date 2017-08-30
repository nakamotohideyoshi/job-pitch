import React, { Component } from 'react';
import Helmet from 'react-helmet';

export default class Privacy extends Component {
  render() {
    return (
      <div>
        <Helmet title="Privacy Policy" />
        <div className="pageHeader">
          <h1>Privacy Policy</h1>
        </div>
        <div className="board">
          <p><b>here text</b></p>
        </div>
      </div>
    );
  }
}

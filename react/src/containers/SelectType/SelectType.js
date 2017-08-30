import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { browserHistory } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import cookie from 'js-cookie';
import styles from './SelectType.scss';

export default class SelectType extends Component {

  selectUserType = (type) => {
    if (type === 'recruiter') {
      localStorage.setItem('first-time', true);
    }
    cookie.set('usertype', type);
    browserHistory.push(`/${type}/find`);
  };

  render() {
    return (
      <div className={styles.container}>
        <Helmet title="Select Type" />
        <h1>Select Type</h1>
        <div className={styles.content}>
          <Button
            bsStyle="success"
            block
            onClick={() => this.selectUserType('recruiter')}
          >Recruiter</Button>
          <Button
            bsStyle="warning"
            block
            onClick={() => this.selectUserType('jobseeker')}
          >Job Seeker</Button>
        </div>
      </div>
    );
  }
}

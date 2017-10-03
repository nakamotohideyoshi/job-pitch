import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { browserHistory } from 'react-router';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import * as utils from 'helpers/utils';
import styles from './SelectType.scss';

export default class SelectType extends Component {

  selectUserType = (type) => {
    if (type === 'recruiter') {
      utils.setShared('first-time', true);
    }
    utils.setShared('usertype', type);
    browserHistory.push('/');
  };

  render() {
    return (
      <div>
        <Helmet title="Select Type" />

        <Modal show className={styles.dialog}>
          <Modal.Body>
            <div className="padding-30">
              <h3>Select Type</h3>

              <Button
                bsStyle="success"
                onClick={() => this.selectUserType('recruiter')}
              >
                I'm a Recruiter
              </Button>
              <Button
                bsStyle="warning"
                onClick={() => this.selectUserType('jobseeker')}
              >
                I'm a JobSeeker
              </Button>
            </div>
          </Modal.Body>
        </Modal>

      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory, Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import _ from 'lodash';
import styles from './JobInterface.scss';

export default class JobInterface extends Component {
  static propTypes = {
    job: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.api = ApiClient.shared();
    const i = _.findIndex(this.api.jobStatuses, { name: 'CLOSED' });
    this.closedStatus = this.api.jobStatuses[i].id;
  }

  onEdit = () => {
    this.props.parent.onEdit(this.props.job);
  }

  onRemove = () => {
    this.props.parent.onRemove(this.props.job);
  }

  onFindTalent = () => {
    utils.setShared('applications_selected_tab', 1);
    browserHistory.push(`/recruiter/applications/${this.props.job.id}`);
  }

  onApplications = () => {
    utils.setShared('applications_selected_tab', 2);
    browserHistory.push(`/recruiter/applications/${this.props.job.id}`);
  }

  onConnections = () => {
    utils.setShared('applications_selected_tab', 3);
    browserHistory.push(`/recruiter/applications/${this.props.job.id}`);
  }

  onShortlist= () => {
    utils.setShared('applications_selected_tab', 4);
    browserHistory.push(`/recruiter/applications/${this.props.job.id}`);
  }

  render() {
    const closed = this.props.job.status === this.closedStatus;
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <h4>{this.props.job.title}{closed ? ' (closed)' : ''}</h4>
          <Link onClick={() => this.props.parent.onInterface()}>{'<< Back'}</Link>
        </div>

        <div className={styles.buttons}>
          <Button
            bsStyle="success"
            onClick={this.onEdit}
          >Edit</Button>
          <Button
            bsStyle="success"
            onClick={this.onRemove}
          >Remove</Button>
          <Button
            bsStyle="success"
            disabled={closed}
            onClick={this.onFindTalent}
          >Find talent</Button>
          <Button
            bsStyle="success"
            disabled={closed}
            onClick={this.onApplications}
          >Applications</Button>
          <Button
            bsStyle="success"
            disabled={closed}
            onClick={this.onConnections}
          >Connections</Button>
          <Button
            bsStyle="success"
            disabled={closed}
            onClick={this.onShortlist}
          >Shortlist</Button>
        </div>
      </div>
    );
  }
}

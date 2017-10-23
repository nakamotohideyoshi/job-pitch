import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import * as utils from 'helpers/utils';
import styles from './JobInterface.scss';

export default class JobInterface extends Component {

  static propTypes = {
    parent: PropTypes.object.isRequired,
    job: PropTypes.object.isRequired,
  }

  onGoApplications = tabKey => {
    utils.setShared('applications_selected_tab', tabKey);
    browserHistory.push(`/recruiter/applications/${this.props.job.id}`);
  }

  render() {
    const { parent, job } = this.props;
    const closed = job.status === utils.getJobStatusByName('CLOSED').id;
    const loading = job.deleting || job.updating;
    return (
      <div className={styles.root}>
        <h4>{job.title}</h4>

        <div className={styles.buttons}>
          <Button
            bsStyle="success"
            disabled={loading}
            onClick={() => parent.onEdit(job)}
          >Edit</Button>

          <Button
            bsStyle="success"
            disabled={loading}
            onClick={() => parent.onRemove(job)}
          >{job.deleting ? 'Deleting...' : 'Delete'}</Button>

          {
            closed &&
            <Button
              bsStyle="success"
              disabled={loading}
              onClick={() => parent.reactivateJob(job)}
            >{job.updating ? 'Reactivating...' : 'Reactivate'}</Button>
          }

          <Button
            bsStyle="success"
            disabled={loading || closed}
            onClick={() => this.onGoApplications(1)}
          >Find talent</Button>

          <Button
            bsStyle="success"
            disabled={loading || closed}
            onClick={() => this.onGoApplications(2)}
          >Applications</Button>

          <Button
            bsStyle="success"
            disabled={loading || closed}
            onClick={() => this.onGoApplications(3)}
          >Connections</Button>

          <Button
            bsStyle="success"
            disabled={loading || closed}
            onClick={() => this.onGoApplications(4)}
          >Shortlist</Button>
        </div>
        <span>{closed ? 'CLOSED' : ''}</span>
      </div>
    );
  }
}

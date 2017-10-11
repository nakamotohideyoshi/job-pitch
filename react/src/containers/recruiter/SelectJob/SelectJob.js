
import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link, browserHistory } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import { ItemList } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './SelectJob.scss';

export default class SelectJob extends Component {

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh = () => {
    this.setState({ jobs: null });
    this.api.getUserJobs('').then(
      jobs => this.setState({ jobs })
    );
  }

  onFilter = (job, filterText) =>
    job.title.toLowerCase().indexOf(filterText) > -1 ||
    job.location_data.name.toLowerCase().indexOf(filterText) > -1 ||
    job.location_data.business_data.name.toLowerCase().indexOf(filterText) > -1;

  onSelect = job => browserHistory.push(`/recruiter/applications/${job.id}`);

  onCreateJob = () => browserHistory.push('/recruiter/jobs');

  renderItem = job => {
    const image = utils.getJobLogo(job, true);
    const jobFullName = utils.getJobFullName(job);
    const tokens = job.location_data.business_data.tokens;
    const strTokens = `${tokens} Credit${tokens !== 1 ? 's' : ''}`;
    const closed = utils.getJobStatus(job) === 'CLOSED';

    return (
      <Link
        key={job.id}
        className={`${styles.job} ${closed ? styles.closed : ''}`}
        onClick={closed ? () => {} : () => this.onSelect(job)}
      >
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.title}>{job.title}</div>
            <div className={styles.info}>
              <div>{jobFullName}</div>
              <span>{strTokens}</span>
            </div>
            <div className={styles.desc}>{job.description}</div>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <div>
      <span>You have not added any jobs yet.</span>
      <br /><br />
      <Button
        bsStyle="success"
        onClick={this.onCreateJob}
      >Create job</Button>
    </div>
  );

  render() {
    return (
      <div className={styles.root}>
        <Helmet title="Select Job" />

        <div className="container">
          <div className="pageHeader">
            <h3>Select Job</h3>
          </div>

          <div className="board-shadow">
            <ItemList
              items={this.state.jobs}
              onFilter={this.onFilter}
              buttons={[
                { label: 'Refresh', bsStyle: 'success', onClick: this.onRefresh }
              ]}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />
          </div>
        </div>

      </div>
    );
  }
}

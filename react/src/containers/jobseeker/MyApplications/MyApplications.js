import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import { Link, browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import { ItemList, JobDetail } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './MyApplications.scss';

export default class MyApplications extends Component {

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.api.getJobProfile(this.api.jobSeeker.profile).then(profile => {
      this.setState({ profile });
      this.onRefresh();
    });
  }

  onRefresh = () => {
    this.setState({ applications: null });
    this.api.getApplications('')
      .then(applications => this.setState({ applications }));
  };

  onFilter = (application, filterText) =>
    utils.getJobSeekerFullName(application.job_seeker).toLowerCase().indexOf(filterText) !== -1;

  onMessage = (event, application) => {
    application = application || this.state.selectedApplication;
    utils.setShared('messages_selected_id', application.id);
    browserHistory.push('/messages');
    if (event) {
      event.stopPropagation();
    }
  };

  onDetail = selectedApplication => this.setState({ selectedApplication });

  renderItem = application => {
    const job = application.job_data;
    // const workplace = job.location_data;
    const jobFullName = utils.getJobFullName(job);
    const image = utils.getJobLogo(job, true);
    job.distance = utils.getDistanceFromLatLonEx(
      job.location_data.latitude,
      job.location_data.longitude,
      this.state.profile.latitude,
      this.state.profile.longitude
    );

    return (
      <Link
        key={application.id}
        className={styles.application}
        onClick={() => this.onDetail(application)}
      >
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.title}>{job.title}</div>
            <div className={styles.subTitle}>{jobFullName}</div>
            <div className={styles.desc}>{job.description}</div>
          </div>
          <div className={styles.controls}>
            <Button
              bsStyle="success"
              onClick={e => this.onMessage(e, application)}
            >Message</Button>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <span>
      {
        'You have no applications.'
      }
    </span>
  );

  render() {
    const { selectedApplication } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="My Applications" />

        <div className="container">
          <div className="pageHeader">
            <h3>My Applications</h3>
          </div>

          <div className="board-shadow">
            <ItemList
              items={this.state.applications}
              onFilter={this.onFilter}
              buttons={[
                { label: 'Refresh', bsStyle: 'success', onClick: this.onRefresh }
              ]}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />

            {
              selectedApplication &&
              <JobDetail
                job={selectedApplication.job_data}
                button1={{
                  label: 'Message',
                  callback: () => this.onMessage()
                }}
                onClose={() => this.onDetail()}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

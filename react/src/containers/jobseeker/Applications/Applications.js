import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { Link, browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import { ItemList, Loading } from 'components';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import _ from 'lodash';
import JobDetail from '../JobDetail/JobDetail';
import styles from './Applications.scss';

@connect(
  () => ({
  }),
  { ...apiActions }
)
export default class Applications extends Component {
  static propTypes = {
    getJobProfileAction: PropTypes.func.isRequired,
    getApplicationsAction: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { };
  }

  componentDidMount() {
    this.props.getJobProfileAction(ApiClient.jobSeeker.profile).then(profile => {
      this.setState({ profile });
      this.onRefresh();
    });
  }

  onRefresh = () => {
    this.setState({ applications: null });
    this.props.getApplicationsAction('')
      .then(applications => this.setState({ applications }));
    // setTimeout(() => {
    //   this.setState({ applications: utils.getTempApplications() });
    // }, 1000);
  };

  onFilter = (application, filterText) =>
    utils.getJobSeekerFullName(application.job_seeker).toLowerCase().indexOf(filterText) !== -1;

  onMessage = (event, application) => {
    browserHistory.push(`/jobseeker/messages/${application.id}`);
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
        <Helmet title="Applications" />

        <div className="container">
          <div className="pageHeader">
            <h3>Applications</h3>
          </div>

          <div className="shadow-board">
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

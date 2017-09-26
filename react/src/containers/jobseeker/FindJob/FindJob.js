import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { Link, browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import { ItemList, Loading } from 'components';
import * as commonActions from 'redux/modules/common';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import _ from 'lodash';
import JobDetail from '../JobDetail/JobDetail';
import styles from './FindJob.scss';

@connect(
  () => ({
  }),
  { ...commonActions, ...apiActions }
)
export default class FindJob extends Component {
  static propTypes = {
    getJobProfileAction: PropTypes.func.isRequired,
    getJobsAction: PropTypes.func.isRequired,
    saveApplicationAction: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
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
    this.setState({ jobs: null });
    this.props.getJobsAction('')
      .then(jobs => this.setState({ jobs }));
    // setTimeout(() => {
    //   this.setState({ jobs: utils.getTempJobs() });
    // }, 1000);
  };

  onFilter = (job, filterText) => job.title.toLowerCase().indexOf(filterText) > -1;

  onApply = (event, job) => {
    const { alertShow } = this.props;
    const { jobs } = this.state;
    job = job || this.state.selectedJob;

    if (ApiClient.jobSeeker.pitches.length === 0) {
      alertShow(
        'Alert',
        'You need to record your pitch video to apply.',
        [
          {
            label: 'Record my pitch',
            style: 'success',
            callback: () => {
              browserHistory.push('/jobseeker/record');
            }
          },
          { label: 'Cancel' },
        ]
      );
    } else {
      alertShow(
        'Confirm',
        'Yes, I want to apply to this job',
        [
          {
            label: 'Apply',
            style: 'success',
            callback: () => {
              job.loading = true;
              this.setState({ jobs });

              this.props.saveApplicationAction({
                job: job.id,
                job_seeker: ApiClient.jobSeeker.id,
              })
                .then(() => {
                  _.remove(jobs, item => item.id === job.id);
                  this.setState({ jobs });
                  utils.successNotif('Success!');
                }, () => {
                  job.loading = false;
                  this.setState({ jobs });
                });
            }
          },
          { label: 'Cancel' },
        ]
      );
    }

    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (event, job) => {
    const { jobs } = this.state;
    job = job || this.state.selectedJob;

    this.props.alertShow(
      'Confirm',
      'Are you sure you are not interested in this job?',
      [
        {
          label: 'I\'m Sure',
          style: 'success',
          callback: () => {
            _.remove(jobs, item => item.id === job.id);
            this.setState({ jobs });
          }
        },
        { label: 'Cancel' },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  }

  onDetail = selectedJob => this.setState({ selectedJob });

  renderItem = job => {
    // check loading
    if (job.loading) {
      return (
        <div
          key={job.id}
          className={styles.job}
        >
          <div><Loading size="25px" /></div>
        </div>
      );
    }

    const image = utils.getJobLogo(job, true);
    job.distance = utils.getDistanceFromLatLonEx(
      job.location_data.latitude,
      job.location_data.longitude,
      this.state.profile.latitude,
      this.state.profile.longitude
    );

    return (
      <Link
        key={job.id}
        className={styles.job}
        onClick={() => this.onDetail(job)}
      >
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.title}>{job.title}</div>
            <div className={styles.distance}>{job.distance}</div>
            <div className={styles.desc}>{job.description}</div>
          </div>
          <div className={styles.controls}>
            <Button
              bsStyle="success"
              onClick={e => this.onApply(e, job)}
            >Apply</Button>
            <Button
              onClick={e => this.onRemove(e, job)}
            >Remove</Button>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <span>
      {
        `There are no more jobs that match your profile.
         You can restore your removed matches by clicking refresh above.`
      }
    </span>
  );

  render() {
    const { selectedJob } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="Find Me Jobs" />

        <div className="container">
          <div className="pageHeader">
            <h3>Find Me Jobs</h3>
          </div>

          <div className="shadow-board">
            <ItemList
              items={this.state.jobs}
              onFilter={this.onFilter}
              buttons={[
                { label: 'Refresh', bsStyle: 'success', onClick: this.onRefresh }
              ]}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />

            {
              selectedJob &&
              <JobDetail
                job={selectedJob}
                button1={{
                  label: 'Apply',
                  callback: () => this.onApply()
                }}
                button2={{
                  label: 'Remove',
                  callback: () => this.onRemove()
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

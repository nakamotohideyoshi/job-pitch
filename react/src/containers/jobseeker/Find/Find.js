import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import { Loading, JobDetail } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Find.scss';

@connect(
  (state) => ({
    jobSeeker: state.auth.jobSeeker,
  }),
  { ...commonActions }
)
export default class Find extends Component {
  static propTypes = {
    jobSeeker: PropTypes.object.isRequired,
    getJobProfile: PropTypes.func.isRequired,
    getJobs: PropTypes.func.isRequired,
    saveApplication: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      jobs: [],
      rejectedJobs: [],
    };
  }

  componentDidMount() {
    const { jobSeeker, getJobProfile } = this.props;
    getJobProfile(jobSeeker.profile).then(profile => {
      this.setState({ profile });
      this.onRefresh();
    });
  }

  onRefresh = () => this.props.getJobs('')
    .then(jobs => this.setState({
      jobs,
      rejectedJobs: [],
    }));

  onDetail = selectedJob => this.setState({ selectedJob });

  onApply = (job, event) => {
    const { jobSeeker, alertShow, saveApplication } = this.props;
    const { selectedJob } = this.state;

    if (jobSeeker.pitches.length === 0) {
      alertShow(
        'Alert',
        'You need to record your pitch video to apply.',
        [
          { label: 'Cancel' },
          {
            label: 'Record my pitch',
            style: 'success',
            callback: () => {
              browserHistory.push('/jobseeker/record');
            }
          }
        ]
      );
    } else {
      alertShow(
        'Confirm',
        'Yes, I want to apply to this job',
        [
          { label: 'Cancel' },
          {
            label: 'Apply',
            style: 'success',
            callback: () => {
              saveApplication({
                job: (job || selectedJob).id,
                job_seeker: jobSeeker.id,
              })
              .then(() => {
                utils.successNotif('Success!');
                this.onRefresh();
              });
            }
          }
        ]
      );
    }
    if (event) {
      event.stopPropagation();
    }
  }

  onNotIntersted = (job, event) => {
    const { rejectedJobs, selectedJob } = this.state;
    this.dismissEdit();
    this.props.alertShow(
      'Confirm',
      'Are you sure you are not interested in this job?',
      [
        { label: 'Cancel' },
        {
          label: 'I\'m Sure',
          style: 'success',
          callback: () => {
            rejectedJobs.push(job || selectedJob);
            this.setState({ rejectedJobs });
          }
        }
      ]
    );
    if (event) {
      event.stopPropagation();
    }
  }

  dismissEdit = () => this.setState({ selectedJob: null });

  renderJob = job => {
    const logo = utils.getJobLogo(job, true);
    job.distance = utils.getDistanceFromLatLonEx(
      job.location_data.latitude,
      job.location_data.longitude,
      this.state.profile.latitude,
      this.state.profile.longitude
    );
    return (
      <Link
        key={job.id}
        className={styles.itemContainer}
        onClick={() => this.onDetail(job)}
      >
        <img src={logo} alt="" />
        <div className={styles.content} >
          <div className={styles.title}>
            <span>{job.title}</span>
            <div>{job.distance}</div>
          </div>
          <div className={styles.description}>
            <span>{job.description}</span>
            <div>
              <button className="btn-icon" onClick={e => this.onNotIntersted(job, e)}>remove</button>|
              <button className="btn-icon" onClick={e => this.onApply(job, e)}>apply</button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  render() {
    const { profile, jobs, rejectedJobs, selectedJob } = this.state;
    if (!profile) {
      return <Loading />;
    }

    const filteredJobs = jobs.filter(job => !rejectedJobs.includes(job));
    return (
      <div>
        <Helmet title="Find Me Jobs" />
        <div className="pageHeader">
          <h1>Find Me Jobs</h1>
          <button
            className="fa fa-refresh btn-icon"
            onClick={this.onRefresh}
          />
        </div>
        <div className="board">
          {
            filteredJobs.length === 0 ?
              <div className={styles.emptyContainer}>
                There are no more jobs that match your profile.<br />
                You can restore your removed matches by clicking refresh above.
              </div> :
              filteredJobs.map(this.renderJob)
          }
        </div>
        {
          selectedJob && (
            <JobDetail
              job={selectedJob}
              resolveName="Apply"
              rejectName="Not Interested"
              onResolve={this.onApply}
              onReject={this.onNotIntersted}
              onClose={this.dismissEdit}
            />
          )
        }
      </div>
    );
  }
}

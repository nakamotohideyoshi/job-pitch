import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { JobSelect, JobSeekerDetail } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Find.scss';

@connect(
  (state) => ({
    selectedJob: state.common.shared.find_job,
    staticData: state.auth.staticData,
  }),
  { ...commonActions }
)
export default class Find extends Component {
  static propTypes = {
    selectedJob: PropTypes.object,
    staticData: PropTypes.object.isRequired,
    getJobSeekers: PropTypes.func.isRequired,
    saveApplication: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
  }

  static defaultProps = {
    selectedJob: null
  }

  constructor(props) {
    super(props);
    this.state = {
      jobSeekers: [],
      rejectedJobSeekers: [],
    };
  }

  componentDidMount() {
    if (this.props.selectedJob) {
      this.onRefresh();
    }
  }

  componentDidUpdate(prevProps) {
    const job = this.props.selectedJob;
    const prevJob = prevProps.selectedJob;
    if (job === prevJob) return;
    if (job && prevJob && job.id === prevJob.id) {
      return;
    }
    this.onRefresh();
  }

  onRefresh = () => {
    const { selectedJob, getJobSeekers } = this.props;
    if (utils.getJobStatus(selectedJob, this.props.staticData.jobStatuses) === 'CLOSED') {
      this.setState({
        jobSeekers: [],
        rejectedJobSeekers: [],
      });
      return;
    }
    getJobSeekers(`?job=${selectedJob.id}`)
      .then(jobSeekers => this.setState({
        jobSeekers,
        rejectedJobSeekers: [],
      }));
  }

  onDetail = (selectedJobSeeker) => this.setState({ selectedJobSeeker });

  onConnect = (jobSeeker, event) => {
    const { selectedJob, saveApplication, alertShow } = this.props;
    const { selectedJobSeeker } = this.state;
    this.dismissEdit();
    alertShow(
      'Confirm',
      'Are you sure you want to connect this talent?',
      [
        { label: 'Cancel' },
        {
          label: 'Connect',
          style: 'success',
          callback: () => {
            saveApplication({
              job: selectedJob.id,
              job_seeker: (jobSeeker || selectedJobSeeker).id,
              shortlisted: false,
            })
            .then(() => {
              utils.successNotif('Connected!');
              this.onRefresh();
            });
          }
        }
      ]
    );
    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (jobSeeker, event) => {
    const { rejectedJobSeekers, selectedJobSeeker } = this.state;
    this.dismissEdit();
    this.props.alertShow(
      'Confirm',
      'Are you sure you want to delete this talent?',
      [
        { label: 'Cancel' },
        {
          label: 'Delete',
          style: 'success',
          callback: () => {
            rejectedJobSeekers.push(jobSeeker || selectedJobSeeker);
            this.setState({ rejectedJobSeekers });
          }
        }
      ]
    );
    if (event) {
      event.stopPropagation();
    }
  }

  dismissEdit = () => this.setState({ selectedJobSeeker: null });

  renderJobSeeker = jobSeeker => {
    const img = utils.getJobSeekerImg(jobSeeker);
    const fullName = utils.getJobSeekerFullName(jobSeeker);
    const tokes = this.selectedJob.location_data.business_data.tokens;
    return (
      <Link
        key={jobSeeker.id}
        className={styles.itemContainer}
        onClick={() => this.onDetail(jobSeeker)}
      >
        <img src={img} alt="" />
        <div className={styles.content} >
          <div className={styles.title}>
            <span>{fullName}</span>
          </div>
          <div className={styles.description}>
            <span>{jobSeeker.description}</span>
            <div>
              <button className="btn-icon" onClick={e => this.onRemove(jobSeeker, e)}>remove</button>|
              <button
                className="btn-icon"
                disabled={tokes === 0}
                onClick={e => this.onConnect(jobSeeker, e)}
              >connect</button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  render() {
    const { selectedJob } = this.props;
    const { jobSeekers, rejectedJobSeekers, selectedJobSeeker } = this.state;
    const filteredJobSeekers = jobSeekers.filter(js => !rejectedJobSeekers.includes(js));
    return (
      <div>
        <Helmet title="Find Me Talent" />
        <div className="pageHeader">
          <h1>Find Me Talent</h1>
        </div>
        <div className="board">
          <JobSelect
            pageId="find_job"
            unselectedLabel="Select job bellow to start finding talent for your business."
          />
          <div className="header">
            <div className="title">Search Results</div>
            {
              selectedJob &&
              <button
                className="fa fa-refresh btn-icon"
                onClick={this.onRefresh}
              />
            }
          </div>
          {
            filteredJobSeekers.length === 0 ?
              <div className={styles.emptyContainer}>
                {
                  this.props.selectedJob &&
                  <div>
                    There are no more new matches for this job.<br />
                    You can restore your removed matches by clicking refresh above.
                  </div>
                }
              </div> :
              filteredJobSeekers.map(this.renderJobSeeker)
          }
          {
            selectedJobSeeker &&
            <JobSeekerDetail
              jobSeeker={selectedJobSeeker}
              resolveName="Connect"
              rejectName="Remove"
              onResolve={this.onConnect}
              onReject={this.onRemove}
              onClose={this.dismissEdit}
            />
          }
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { Link, browserHistory } from 'react-router';
import { COUNT_PER_PAGE } from 'const';
import { Loading, ItemList, JobDetail, Pagination, LogoImage } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import _ from 'lodash';
import styles from './FindJob.scss';

@connect(
  () => ({ }),
  { ...commonActions }
)
export default class FindJob extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
  }

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
    this.setState({ jobs: null });
    this.api.getJobs('').then(
      jobs => this.setState({ jobs, page: 0 })
    );
  };

  onSelectPage = page => this.setState({ page });

  onApply = (job, event) => {
    const { alertShow } = this.props;
    const { jobs } = this.state;

    if (this.api.jobSeeker.pitches.length === 0) {
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
          },
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
              job.loading = true;
              this.setState({ jobs });

              this.api.saveApplication({
                job: job.id,
                job_seeker: this.api.jobSeeker.id,
              }).then(
                () => {
                  _.remove(jobs, item => item.id === job.id);
                  this.setState({ jobs });
                  utils.successNotif('Success!');
                },
                () => {
                  job.loading = false;
                  this.setState({ jobs });
                });
            }
          },
        ]
      );
    }

    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (job, event) => {
    const { jobs } = this.state;

    this.props.alertShow(
      'Confirm',
      'Are you sure you are not interested in this job?',
      [
        { label: 'Cancel' },
        {
          label: 'I\'m Sure',
          style: 'success',
          callback: () => {
            _.remove(jobs, item => item.id === job.id);
            this.setState({ jobs });
          }
        },
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

    const image = utils.getJobLogo(job);
    job.distance = utils.getDistanceFromLatLonEx(
      job.location_data.latitude,
      job.location_data.longitude,
      this.state.profile.latitude,
      this.state.profile.longitude
    );

    return (
      <Link
        key={job.id}
        className={[styles.job, 'list-item'].join(' ')}
        onClick={() => this.onDetail(job)}
      >
        <LogoImage image={image} />
        <div className="content">
          <div>
            <h5>{job.title}</h5>
            <span className={styles.distance}>{job.distance}</span>
          </div>
          <span>{job.description}</span>
        </div>

        <div className="controls">
          <Button
            bsStyle="success"
            onClick={e => this.onApply(job, e)}
          >Apply</Button>
          <Button
            onClick={e => this.onRemove(job, e)}
          >Remove</Button>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <div>
      <span>
        {
          `There are no more jobs that match your profile.
          You can restore your removed matches by clicking refresh.`
        }
      </span>
      <button className="link-btn" onClick={this.onRefresh}>
        Refresh
      </button>
    </div>
  );

  render() {
    const { selectedJob, jobs } = this.state;
    let total = 0;
    let page;
    let pageJobs;

    if (jobs) {
      total = jobs.length;
      const nPage = Math.ceil(total / COUNT_PER_PAGE);
      page = Math.max(0, Math.min(this.state.page, nPage - 1));
      const offset = page * COUNT_PER_PAGE;
      pageJobs = jobs.slice(offset, Math.min(offset + COUNT_PER_PAGE, total));
    }

    return (
      <div className={styles.root}>
        <Helmet title="Find Me Jobs" />

        <div className="container">
          <div className="pageHeader">
            <h3>Find Me Jobs</h3>
          </div>

          <div className="board shadow">
            <ItemList
              items={pageJobs}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />
            {
              selectedJob &&
              <JobDetail
                job={selectedJob}
                button1={{
                  label: 'Apply',
                  callback: () => this.onApply(selectedJob)
                }}
                button2={{
                  label: 'Remove',
                  callback: () => this.onRemove(selectedJob)
                }}
                onClose={() => this.onDetail()}
              />
            }
          </div>
          {
            total > COUNT_PER_PAGE &&
            <div className={styles.paginationController}>
              <Pagination
                total={total}
                index={page}
                onSelect={this.onSelectPage}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

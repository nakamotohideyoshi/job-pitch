import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { Loading, ItemList, JobSeekerDetail } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import _ from 'lodash';
import styles from './FindTalent.scss';

@connect(
  () => ({
  }),
  { ...commonActions }
)
export default class FindTalent extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    parent: PropTypes.object.isRequired,
    job: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh = () => {
    this.setState({ jobSeekers: null });
    this.api.getJobSeekers(`?job=${this.props.job.id}`).then(
      jobSeekers => this.setState({ jobSeekers })
    );
  }

  onFilter = (jobSeeker, filterText) =>
    utils.getJobSeekerFullName(jobSeeker).toLowerCase().indexOf(filterText) !== -1;

  onConnect = (jobSeeker, event) => {
    const { jobSeekers } = this.state;

    this.props.alertShow(
      'Confirm',
      'Are you sure you want to connect this talent?',
      [
        { label: 'Cancel' },
        {
          label: 'Connect',
          style: 'success',
          callback: () => {
            jobSeeker.loading = true;
            this.setState({ jobSeekers });

            this.api.saveApplication({
              job: this.props.job.id,
              job_seeker: jobSeeker.id,
              shortlisted: false,
            }).then(
              () => {
                _.remove(jobSeekers, item => item.id === jobSeeker.id);
                this.setState({ jobSeekers });
                this.props.parent.onRefreshAll();
                utils.successNotif('Connected!');
              },
              () => {
                jobSeeker.loading = false;
                this.setState({ jobSeekers });
              }
            );
          }
        },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  };

  onRemove = (jobSeeker, event) => {
    const { jobSeekers } = this.state;

    this.props.alertShow(
      'Confirm',
      'Are you sure you want to delete this talent?',
      [
        { label: 'Cancel' },
        {
          label: 'Delete',
          style: 'success',
          callback: () => {
            _.remove(jobSeekers, item => item.id === jobSeeker.id);
            this.setState({ jobSeekers });
          }
        },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  };

  onDetail = selectedJobSeeker => this.setState({ selectedJobSeeker });

  renderItem = jobSeeker => {
    // check loading
    if (jobSeeker.loading) {
      return (
        <div
          key={jobSeeker.id}
          className={styles.jobSeeker}
        >
          <div><Loading size="25px" /></div>
        </div>
      );
    }

    const image = utils.getJobSeekerImg(jobSeeker);
    const fullName = utils.getJobSeekerFullName(jobSeeker);
    const tokens = this.props.job.location_data.business_data.tokens;

    return (
      <Link
        key={jobSeeker.id}
        className={styles.jobSeeker}
        onClick={() => this.onDetail(jobSeeker)}
      >
        <img src={image} alt="" />
        <div className={styles.content} >
          <div className={styles.name}>{fullName}</div>
          <div className={styles.desc}>{jobSeeker.description}</div>
        </div>
        <div className={styles.controls}>
          <Button
            bsStyle="success"
            disabled={tokens === 0}
            onClick={e => this.onConnect(jobSeeker, e)}
          >Connect</Button>
          <Button
            onClick={e => this.onRemove(jobSeeker, e)}
          >Remove</Button>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <span>
      {
        `There are no more new matches for this job.
         You can restore your removed matches by clicking refresh above.`
      }
    </span>
  );

  render() {
    const { selectedJobSeeker } = this.state;

    return (
      <div>
        <ItemList
          items={this.state.jobSeekers}
          onFilter={this.onFilter}
          buttons={[
            { label: 'Refresh', bsStyle: 'success', onClick: this.onRefresh }
          ]}
          renderItem={this.renderItem}
          renderEmpty={this.renderEmpty}
        />

        {
          selectedJobSeeker &&
          <JobSeekerDetail
            jobSeeker={selectedJobSeeker}
            button1={{
              label: 'Connect',
              callback: () => this.onConnect(selectedJobSeeker)
            }}
            button2={{
              label: 'Remove',
              callback: () => this.onRemove(selectedJobSeeker)
            }}
            onClose={() => this.onDetail()}
          />
        }
      </div>
    );
  }
}

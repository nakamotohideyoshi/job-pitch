import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { COUNT_PER_PAGE } from 'const';
import { Loading, ItemList, JobSeekerDetail, Pagination, LogoImage } from 'components';
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
      jobSeekers => this.setState({ jobSeekers, page: 0 })
    );
  }

  onSelectPage = page => this.setState({ page });

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
        className={[styles.jobSeeker, 'list-item'].join(' ')}
        onClick={() => this.onDetail(jobSeeker)}
      >
        <LogoImage image={image} />
        <div className="content">
          <h5>{fullName}</h5>
          <span>{jobSeeker.description}</span>
        </div>
        <div className="controls">
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
    <div>
      <span>
        {
          `There are no more new matches for this job.
          You can restore your removed matches by clicking refresh above.`
        }
      </span>
      <button className="link-btn" onClick={this.onRefresh}>
        Refresh
      </button>
    </div>
  );

  render() {
    const { selectedJobSeeker, jobSeekers } = this.state;
    let total = 0;
    let page;
    let pageJobSeekers;

    if (jobSeekers) {
      total = jobSeekers.length;
      const nPage = Math.ceil(total / COUNT_PER_PAGE);
      page = Math.max(0, Math.min(this.state.page, nPage - 1));
      const offset = page * COUNT_PER_PAGE;
      pageJobSeekers = jobSeekers.slice(offset, Math.min(offset + COUNT_PER_PAGE, total));
    }

    return (
      <div>
        <ItemList
          items={pageJobSeekers}
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
    );
  }
}

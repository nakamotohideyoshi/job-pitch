import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { ItemList, Loading } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import _ from 'lodash';
import JobEdit from './JobEdit';
import styles from './JobList.scss';

@connect(
  () => ({
  }),
  { ...commonActions }
)
export default class JobList extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    workplaceId: PropTypes.number,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    workplaceId: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();

    const i = _.findIndex(this.api.jobStatuses, { name: 'CLOSED' });
    this.closedStatus = this.api.jobStatuses[i].id;

    this.props.parent.jobList = this;
  }

  componentWillReceiveProps(nextProps) {
    if (this.workplaceId !== nextProps.workplaceId) {
      this.workplaceId = nextProps.workplaceId;
      this.onRefresh();
    }
  }

  onRefresh = () => {
    this.setState({ jobs: null, editingJob: null });
    if (this.workplaceId) {
      this.api.getUserJobs(`?location=${this.workplaceId}`)
        .then(jobs => this.setState({ jobs }));
    }
  }

  onFilter = (job, filterText) => job.title.toLowerCase().indexOf(filterText) > -1;

  onAdd = () => {
    if (this.workplaceId) {
      this.setState({
        editingJob: { workplace: this.workplaceId }
      });
    }
  }

  onEdit = (event, job) => {
    this.setState({ editingJob: job });

    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (event, job) => {
    const buttons = [
      {
        label: 'Delete',
        style: 'success',
        callback: () => {
          job.loading = true;
          this.setState({ jobs: this.state.jobs });

          this.api.deleteUserJob(job.id).then(
            () => {
              _.remove(this.state.jobs, item => item.id === job.id);
              this.setState({ jobs: this.state.jobs });
              utils.successNotif('Deleted!');
            },
            () => {
              job.loading = false;
              this.setState({ jobs: this.state.jobs });
            }
          );
        }
      },
      { label: 'Cancel' }
    ];

    if (job.status !== this.closedStatus) {
      buttons.unshift({
        label: 'Deactive',
        style: 'success',
        callback: () => {
          job.loading = true;
          this.setState({ jobs: this.state.jobs });

          const oldStatus = job.status;
          job.status = this.closedStatus;
          this.api.saveUserJob(job).then(
            () => {
              job.loading = false;
              this.setState({ jobs: this.state.jobs });
              utils.successNotif('Closed!');
            },
            () => {
              job.loading = false;
              job.status = oldStatus;
              this.setState({ jobs: this.state.jobs });
            }
          );
        }
      });
    }

    this.props.alertShow(
      'Confirm',
      `Are you sure you want to delete ${job.title}`,
      buttons
    );

    if (event) {
      event.stopPropagation();
    }
  }

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
    const closedClass = job.status === this.closedStatus ? styles.closed : '';
    return (
      <Link
        key={job.id}
        className={[styles.job, closedClass].join(' ')}
        onClick={e => this.onEdit(e, job)}>
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.title}>{job.title}</div>
            <div className={styles.comment}></div>
          </div>
          <div className={styles.controls}>
            <Button
              bsStyle="success"
              onClick={e => this.onEdit(e, job)}
            >Edit</Button>
            <Button
              onClick={e => this.onRemove(e, job)}
            >Remove</Button>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <div>
      <span>
        {
          `You have not added any
           jobs yet.`
        }
      </span>
      <br />
      <button className="link-btn" onClick={this.onAdd}>Create job</button>
    </div>
  );

  render() {
    if (!this.workplaceId) {
      return (
        <div className="board-shadow">
        </div>
      );
    }

    const { editingJob } = this.state;
    return (
      <div className="board-shadow">
        {
          editingJob ?
            <JobEdit
              job={editingJob}
              parent={this}
            /> :
            <ItemList
              items={this.state.jobs}
              onFilter={this.onFilter}
              buttons={[
                { label: 'New Job', bsStyle: 'success', onClick: this.onAdd }
              ]}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />
        }
      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import { ItemList, Loading } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import JobEdit from './JobEdit';
import JobInterface from './JobInterface';
import styles from './JobList.scss';

@connect(
  () => ({ }),
  { ...commonActions }
)
export default class JobList extends Component {

  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    parent: PropTypes.object.isRequired,
    jobs: PropTypes.array,
    selectedJob: PropTypes.object,
  }

  static defaultProps = {
    jobs: null,
    selectedJob: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.manager = this.props.parent;
    this.manager.jobList = this;
    this.api = ApiClient.shared();
    this.closedStatus = utils.getJobStatusByName('CLOSED').id;
  }

  onFilter = (job, filterText) =>
    job.title.toLowerCase().indexOf(filterText) > -1;

  onAdd = () => {
    if (utils.getShared('first-time') === '3') {
      utils.setShared('first-time');
      this.setState({ firstTime: null });
    }

    this.setState({
      editingData: {
        location: this.manager.getWorkplaceId(),
        active: true,
      }
    });
  }

  onRemove = (job, event) => {
    const buttons = [
      { label: 'Cancel' },
      {
        label: 'Delete',
        style: 'success',
        callback: () => this.manager.deleteJob(job)
      },
    ];

    if (job.status !== this.closedStatus) {
      buttons.push({
        label: 'Deactivate',
        style: 'success',
        callback: () => this.manager.updateJobStatus(job, 'CLOSED'),
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

  onEdit = (job, event) => {
    this.setState({ editingData: job });

    if (event) {
      event.stopPropagation();
    }
  }

  reactivateJob = job => {
    this.manager.updateJobStatus(job, 'OPEN');
  }

  renderItem = job => {
    // check loading
    if (job.deleting || job.updating) {
      return (
        <div key={job.id} className={styles.job}>
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
        onClick={() => this.manager.selectJob(job)}
      >
        <img src={image} alt="" />
        <div className={styles.content} >
          <div className={styles.title}>{job.title}</div>
          <div className={styles.info}></div>
        </div>
        <div className={styles.controls}>
          <Button
            bsStyle="success"
            onClick={e => this.onEdit(job, e)}
          >Edit</Button>
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
          utils.getShared('first-time') === '3' ?
          'Okay, last step, now create your first job'
          :
          'This workplace doesn\'t seem to have any jobs yet!'
        }
      </span>
      <button className="link-btn" onClick={this.onAdd}>Create job</button>
    </div>
  );

  render() {
    const { editingData } = this.state;
    const { selectedJob } = this.props;

    if (editingData) {
      return (
        <div className="board-shadow">
          <JobEdit
            parent={this}
            job={editingData}
          />
        </div>
      );
    }

    if (selectedJob) {
      return (
        <div className="board-shadow">
          <JobInterface
            parent={this}
            job={selectedJob}
          />
        </div>
      );
    }

    return (
      <div className="board-shadow">
        <ItemList
          items={this.props.jobs}
          onFilter={this.onFilter}
          buttons={[
            { label: 'New Job', bsStyle: 'success', onClick: this.onAdd }
          ]}
          renderItem={this.renderItem}
          renderEmpty={this.renderEmpty}
        />
      </div>
    );
  }
}

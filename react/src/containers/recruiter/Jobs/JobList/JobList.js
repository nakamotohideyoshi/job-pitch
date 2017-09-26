import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { ItemList, Loading } from 'components';
import * as commonActions from 'redux/modules/common';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import _ from 'lodash';
import JobEdit from './JobEdit';
import styles from './JobList.scss';

@connect(
  () => ({
  }),
  { ...commonActions, ...apiActions }
)
export default class JobList extends Component {
  static propTypes = {
    getUserJobsByWorkplaceAction: PropTypes.func.isRequired,
    deleteUserJobAction: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
    workplaceId: PropTypes.number,
  }

  static defaultProps = {
    workplaceId: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
  }

  componentWillReceiveProps(nextProps) {
    if (this.workplaceId !== nextProps.workplaceId) {
      this.workplaceId = nextProps.workplaceId;
      this.onRefresh();
    }
  }

  onRefresh = () => {
    this.setState({ jobs: null });
    if (this.workplaceId) {
      this.props.getUserJobsByWorkplaceAction(this.workplaceId)
        .then(jobs => this.setState({ jobs }));
    }
  }

  onFilter = (job, filterText) => job.title.toLowerCase().indexOf(filterText) > -1;

  onAdd = () => {
    this.setState({ editingJob: {} });
  }

  onEdit = (event, job) => {
    this.setState({ editingJob: job });

    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (event, job) => {
    this.props.alertShow(
      'Confirm',
      `Are you sure you want to delete ${job.title}`,
      [
        {
          label: 'Delete',
          style: 'success',
          callback: () => {
            job.loading = true;
            this.setState({ jobs: this.state.jobs });

            this.props.deleteUserJobAction(job.id)
              .then(() => {
                _.remove(this.state.jobs, item => item.id === job.id);
                this.setState({ jobs: this.state.jobs });
                utils.successNotif('Deleted!');
              })
              .catch(() => {
                job.loading = false;
                this.setState({ jobs: this.state.jobs });
              });
          }
        },
        { label: 'Cancel' },
      ]
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
    return (
      <Link
        key={job.id}
        className={styles.job}
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
      <button className="btn-icon" onClick={this.onAdd}>Create job</button>
    </div>
  );

  render() {
    if (!this.props.workplaceId) {
      return (
        <div className="shadow-board">
        </div>
      );
    }

    const { editingJob } = this.state;
    return (
      <div className="shadow-board">
        {
          editingJob ?
            <JobEdit
              workplaceId={this.props.workplaceId}
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

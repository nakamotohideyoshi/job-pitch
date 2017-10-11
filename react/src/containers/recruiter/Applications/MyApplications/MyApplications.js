
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { Loading, ItemList, JobSeekerDetail } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import styles from './MyApplications.scss';

@connect(
  () => ({ }),
  { ...commonActions }
)
export default class MyApplications extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    parent: PropTypes.object.isRequired,
    applications: PropTypes.array,
    job: PropTypes.object.isRequired,
  }

  static defaultProps = {
    applications: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.applications) {
      const status = utils.getApplicationStatusByName('CREATED').id;
      this.setState({
        applications: nextProps.applications.filter(item => item.status === status)
      });
    } else {
      this.setState({
        applications: null
      });
    }
  }

  onFilter = (application, filterText) =>
    utils.getJobSeekerFullName(application.job_seeker).toLowerCase().indexOf(filterText) !== -1;

  onConnect = (application, event) => {
    const { onUpdatedApplications } = this.props.parent;

    this.props.alertShow(
      'Confirm',
      'Yes, I want to make this connection (1 credit)',
      [
        {
          label: 'Connect',
          style: 'success',
          callback: () => {
            application.loading = true;
            onUpdatedApplications();

            this.api.saveApplication({
              id: application.id,
              connect: utils.getApplicationStatusByName('ESTABLISHED').id,
            })
              .then(() => {
                application.loading = false;
                application.status = utils.getApplicationStatusByName('ESTABLISHED').id;
                onUpdatedApplications();
                this.props.parent.onRefreshJob();
                utils.successNotif('Connected!');
              })
              .catch(() => {
                application.loading = false;
                onUpdatedApplications();
              });
          }
        },
        { label: 'Cancel' },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  };

  onRemove = (application, event) => {
    const { onUpdatedApplications } = this.props.parent;

    this.props.alertShow(
      'Confirm',
      'Are you sure you want to delete this applicaton?',
      [
        {
          label: 'Delete',
          style: 'success',
          callback: () => {
            application.loading = true;
            onUpdatedApplications();

            this.api.deleteApplication(application)
              .then(() => {
                application.loading = false;
                application.status = utils.getApplicationStatusByName('DELETED').id;
                onUpdatedApplications();
                utils.successNotif('Deleted!');
              })
              .catch(() => {
                application.loading = false;
                onUpdatedApplications();
              });
          }
        },
        { label: 'Cancel' },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  };

  onDetail = application => this.setState({
    selectedApplication: application
  });

  renderItem = application => {
    // check loading
    if (application.loading) {
      return (
        <div
          key={application.id}
          className={styles.application}
        >
          <div><Loading size="25px" /></div>
        </div>
      );
    }

    const jobSeeker = application.job_seeker;
    const image = utils.getJobSeekerImg(jobSeeker);
    const fullName = utils.getJobSeekerFullName(jobSeeker);

    return (
      <Link
        key={application.id}
        className={styles.application}
        onClick={() => this.onDetail(application)}
      >
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.name}>{fullName}</div>
            <div className={styles.desc}>{jobSeeker.description}</div>
          </div>
          <div className={styles.controls}>
            <Button
              bsStyle="success"
              disabled={this.props.job.location_data.business_data.tokens === 0}
              onClick={e => this.onConnect(application, e)}
            >Connect</Button>
            <Button
              onClick={e => this.onRemove(application, e)}
            >Remove</Button>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <span>
      {
        `No candidates have applied for this job yet.
         Once that happens, their applications will appear here.`
      }
    </span>
  );

  render() {
    const { selectedApplication } = this.state;

    return (
      <div>
        <ItemList
          items={this.state.applications}
          onFilter={this.onFilter}
          buttons={[
            { label: 'Refresh', bsStyle: 'success', onClick: this.props.parent.onRefreshApplications }
          ]}
          renderItem={this.renderItem}
          renderEmpty={this.renderEmpty}
        />

        {
          selectedApplication &&
          <JobSeekerDetail
            jobSeeker={selectedApplication.job_seeker}
            button1={{
              label: 'Connect',
              callback: () => this.onConnect(selectedApplication)
            }}
            button2={{
              label: 'Remove',
              callback: () => this.onRemove(selectedApplication)
            }}
            onClose={() => this.onDetail()}
          />
        }
      </div>
    );
  }
}

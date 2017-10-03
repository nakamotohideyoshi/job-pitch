import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { Loading, ItemList, JobSeekerDetail } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import styles from './MyConnections.scss';

@connect(
  () => ({ }),
  { ...commonActions }
)
export default class MyConnections extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    parent: PropTypes.object.isRequired,
    applications: PropTypes.array,
    shortlisted: PropTypes.bool,
  }

  static defaultProps = {
    applications: null,
    shortlisted: false,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.applications) {
      const status = utils.getApplicationStatusByName('ESTABLISHED').id;
      this.setState({
        applications: nextProps.applications.filter(
          item => item.status === status && (!nextProps.shortlisted || item.shortlisted)
        )
      });
    } else {
      this.setState({
        applications: null
      });
    }
  }

  onFilter = (application, filterText) =>
    utils.getJobSeekerFullName(application.job_seeker).toLowerCase().indexOf(filterText) !== -1;

  onMessage = (event, application) => {
    application = application || this.state.selectedApplication;
    utils.setShared('messages_selected_id', application.id);
    browserHistory.push('/messages');
    if (event) {
      event.stopPropagation();
    }
  };

  onRemove = (event, application) => {
    const { onUpdatedApplications } = this.props.parent;
    application = application || this.state.selectedApplication;

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

            this.api.deleteApplication(application.id)
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

  onDetail = selectedApplication => this.setState({
    selectedApplication
  });

  onChangedShortlist = shortlisted => {
    const { selectedApplication } = this.state;

    return this.api.saveApplication({
      id: selectedApplication.id,
      shortlisted,
    }).then(() => {
      selectedApplication.shortlisted = shortlisted;
      this.props.parent.onUpdatedApplications();
      return Promise.resolve();
    });
  };

  renderItem = application => {
    const { shortlisted } = this.props;

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
          {
            !shortlisted && application.shortlisted &&
            <div className={styles.star}>
              <i className="fa fa-star" />
            </div>
          }
          <div className={styles.content}>
            <div className={styles.name}>{fullName}</div>
            <div className={styles.desc}>{jobSeeker.description}</div>
          </div>
          <div className={styles.control}>
            <Button
              bsStyle="success"
              onClick={event => this.onMessage(event, application)}
            >Message</Button>
            <Button
              onClick={event => this.onRemove(event, application)}
            >Remove</Button>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <span>
      {
        this.props.shortlisted ?
          `You have not shortlisted any applications for this job,\n
           turn off shortlist view to see the non-shortlisted applications.` :
          `You have not chosen anyone to connect with for this job.\n
           Once that happens, you will be able to sort through them from here.\n
           You can switch to search mode to look for potential applicants.`
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
            application={selectedApplication}
            button1={{
              label: 'Message',
              callback: () => this.onMessage()
            }}
            button2={{
              label: 'Remove',
              callback: () => this.onRemove()
            }}
            onClose={() => this.onDetail()}
            onChangedShortlist={this.onChangedShortlist}
          />
        }
      </div>
    );
  }
}

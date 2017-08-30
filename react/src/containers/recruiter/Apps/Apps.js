import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { JobSelect, JobSeekerDetail, Message } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Apps.scss';

const PAGE_DATA = {
  '/recruiter/applications': {
    pageId: 'r_p_apps',
    title: 'My Applications',
    unselectedLabel: 'Select a job below to view job seekers who have expressed interest in a job.',
    emptyLabel: `No applications at the moment. Once thet happens you cant go trough them here and shortlist 
if needed, you can easy switch to Find Talent mode and "head hunt" as well.`,
    resolveLabel: 'Connect',
    appStatus: 'CREATED',
  },
  '/recruiter/connections': {
    pageId: 'r_p_connes',
    title: 'My Connections',
    unselectedLabel: 'Select a job below to view job seekers you have connected with.',
    emptyLabel: `You have not chosen anyone to connect with for this job. 
      Once that happens, you will be able to sort through them from here. 
      You can switch to search mode to look for potential applicants.`,
    resolveLabel: 'Message',
    appStatus: 'ESTABLISHED',
  },
  '/recruiter/shortlist': {
    pageId: 'r_p_shortlist',
    title: 'My Shortlist',
    unselectedLabel: 'Select a job below to view the job seekers you have shortlisted for that role.',
    emptyLabel: `You have not shortlisted any applications for this job, 
      turn off shortlist view to see the non-shortlisted applications.`,
    resolveLabel: 'Message',
    appStatus: 'ESTABLISHED',
  }
};

@connect(
  (state) => ({
    staticData: state.auth.staticData,
    shared: state.common.shared,
  }),
  { ...commonActions }
)
export default class Apps extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    staticData: PropTypes.object.isRequired,
    shared: PropTypes.object.isRequired,
    getApplications: PropTypes.func.isRequired,
    saveApplication: PropTypes.func.isRequired,
    deleteApplication: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      applications: [],
    };

    const { location, staticData } = this.props;
    this.pageData = PAGE_DATA[location.pathname];

    this.appStatusId = utils.getItemByName(staticData.applicationStatuses, this.pageData.appStatus).id;
    this.shortlistedQuery = this.pageData.pageId === 'r_p_shortlist' ? '&shortlisted=1' : '';
  }

  componentDidMount() {
    if (this.props.shared[this.pageData.pageId]) {
      this.onRefresh();
    }
  }

  componentDidUpdate(prevProps) {
    const { pageId } = this.pageData;
    const job = this.props.shared[pageId];
    const prevJob = prevProps.shared[pageId];
    if (job === prevJob) return;
    if (job && prevJob && job.id === prevJob.id) {
      return;
    }
    this.onRefresh();
  }

  onRefresh = () => {
    const { getApplications } = this.props;
    this.selectedJob = this.props.shared[this.pageData.pageId];
    
    getApplications(`?job=${this.selectedJob.id}&status=${this.appStatusId}${this.shortlistedQuery}`)
      .then(applications => this.setState({ applications }));
  }

  onDetail = (selectedApp) => this.setState({
    selectedApp,
    isDetail: true,
  });

  onResolve = (application, event) => {
    const { selectedApp } = this.state;
    if (this.pageData.pageId === 'r_p_apps') {
      const { staticData, saveApplication, alertShow } = this.props;
      this.dismissEdit();
      alertShow(
        'Confirm',
        'Yes, I want to make this connection (1 credit)',
        'Cancel', null,
        'Connect', () => {
          saveApplication({
            id: (application || selectedApp).id,
            connect: utils.getItemByName(staticData.applicationStatuses, 'ESTABLISHED').id,
          })
          .then(() => {
            utils.successNotif('Success!');
            this.onRefresh();
          });
        },
      );
    } else {
      this.setState({
        selectedApp: application || selectedApp,
        isDetail: false,
      });
    }

    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (application, event) => {
    const { deleteApplication, alertShow } = this.props;
    this.dismissEdit();
    alertShow(
      'Confirm',
      'Are you sure you want to delete this applicaton?',
      'Cancel', null,
      'Delete', () => {
        deleteApplication((application || this.state.selectedApp).id)
          .then(() => {
            utils.successNotif('Deleted!');
            this.onRefresh();
          });
      },
    );
    if (event) {
      event.stopPropagation();
    }
  }

  onChangeShortlist = shortlisted => {
    this.props.saveApplication({
      id: this.state.selectedApp.id,
      shortlisted,
    })
    .then(this.onRefresh);
  };

  dismissEdit = () => this.setState({ selectedApp: null });

  renderApplication = application => {
    const jobSeeker = application.job_seeker;
    const img = utils.getJobSeekerImg(jobSeeker);
    const fullName = utils.getJobSeekerFullName(jobSeeker);
    const { pageId } = this.pageData;
    const job = this.props.shared.selectedJob;
    const disabled = pageId === 'r_p_apps' && job.location_data.business_data.tokens === 0;
    return (
      <Link
        key={jobSeeker.id}
        className={styles.itemContainer}
        onClick={() => this.onDetail(application)}
      >
        <img src={img} alt="" />
        <div className={styles.content} >
          <div className={styles.title}>
            <span>{fullName}</span>
            {
              this.pageData.pageId !== 'r_p_shortlist' && application.shortlisted &&
              <div><i className="fa fa-star" aria-hidden="true" /></div>
            }
          </div>
          <div className={styles.description}>
            <span>{jobSeeker.description}</span>
            <div>
              <button className="btn-icon" onClick={e => this.onRemove(application, e)}>remove</button>|
              <button
                className="btn-icon"
                disabled={disabled}
                onClick={e => this.onResolve(application, e)}
              >
                {this.pageData.resolveLabel.toLowerCase()}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  render() {
    const { applications, selectedApp, isDetail } = this.state;
    const { title, unselectedLabel, emptyLabel, resolveLabel } = this.pageData;
    return (
      <div>
        <Helmet title={title} />
        <div className="pageHeader">
          <h1>{title}</h1>
        </div>
        <div className="board">
          <JobSelect
            unselectedLabel={unselectedLabel}
          />
          <div className="header">
            <div className="title">Applications</div>
            {
              this.selectedJob &&
              <button
                className="fa fa-refresh btn-icon"
                onClick={this.onRefresh}
              />
            }
          </div>
          {
            applications.length === 0 ?
              <div className={styles.emptyContainer}>
                {
                  this.selectedJob &&
                  <div className={styles.emptyLabel}>{emptyLabel}</div>
                }
              </div> :
              applications.map(this.renderApplication)
          }
          {
            selectedApp && (
              isDetail ?
                <JobSeekerDetail
                  application={selectedApp}
                  jobSeeker={selectedApp.job_seeker}
                  resolveName={resolveLabel}
                  rejectName="Remove"
                  onResolve={this.onResolve}
                  onReject={this.onRemove}
                  onChangeShortlist={this.onChangeShortlist}
                  onClose={this.dismissEdit}
                /> :
                <Message
                  application={selectedApp}
                  onClose={this.dismissEdit}
                />
            )
          }
        </div>
      </div>
    );
  }
}

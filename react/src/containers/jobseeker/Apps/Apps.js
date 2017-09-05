import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { Loading, JobDetail, Message } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Apps.scss';

@connect(
  (state) => ({
    jobSeeker: state.auth.jobSeeker,
  }),
  { ...commonActions }
)
export default class Apps extends Component {
  static propTypes = {
    jobSeeker: PropTypes.object.isRequired,
    getJobProfile: PropTypes.func.isRequired,
    getApplications: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      applications: [],
    };
  }

  componentDidMount() {
    const { jobSeeker, getJobProfile } = this.props;
    getJobProfile(jobSeeker.profile).then(profile => {
      this.setState({ profile });
      this.onRefresh();
    });
  }

  onRefresh = () => this.props.getApplications('')
    .then(applications => this.setState({ applications }));

  onDetail = (selectedApp) => this.setState({
    selectedApp: selectedApp || this.state.selectedApp,
    isDetail: true,
  });

  onMessage = (application, event) => {
    this.setState({
      selectedApp: application || this.state.selectedApp,
      isDetail: false,
    });
    if (event) {
      event.stopPropagation();
    }
  }

  dismissEdit = () => this.setState({ selectedApp: null });

  renderApplication = application => {
    const job = application.job_data;
    const workplace = job.location_data;
    const jobFullName = utils.getJobFullName(job);
    const logo = utils.getJobLogo(job, true);
    job.distance = utils.getDistanceFromLatLonEx(
      job.location_data.latitude,
      job.location_data.longitude,
      this.state.profile.latitude,
      this.state.profile.longitude
    );
    return (
      <Link
        key={job.id}
        className={styles.itemContainer}
        onClick={() => this.onDetail(application)}
      >
        <img src={logo} alt="" />
        <div className={styles.content} >
          <div className={styles.title}>
            <span>{job.title}</span>
          </div>
          <div className={styles.address}>
            <span>{jobFullName}</span>
            <div><i className="fa fa-map-marker" />{workplace.place_name}</div>
          </div>
          <div className={styles.description}>
            <span>{job.description}</span>
            <div>
              <button className="btn-icon" onClick={e => this.onMessage(application, e)}>message</button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  render() {
    const { profile, applications, selectedApp, isDetail } = this.state;
    if (!profile) {
      return <Loading />;
    }

    return (
      <div>
        <Helmet title="Applications" />
        <div className="pageHeader">
          <h1>Applications</h1>
          <button
            className="fa fa-refresh btn-icon"
            onClick={this.onRefresh}
          />
        </div>
        <div className="board">
          {
            applications.length === 0 ?
              <div className={styles.emptyContainer}>
                You have no applications.
              </div> :
              applications.map(this.renderApplication)
          }
          {
            selectedApp && (
              isDetail ?
                <JobDetail
                  job={selectedApp.job_data}
                  resolveName="Message"
                  onResolve={this.onMessage}
                  onClose={this.dismissEdit}
                /> :
                <Message
                  application={selectedApp}
                  onClose={this.dismissEdit}
                  onDetail={this.onDetail}
                />
            )
          }
        </div>
      </div>
    );
  }
}

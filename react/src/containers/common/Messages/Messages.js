import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { Message, JobSeekerDetail, JobDetail } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Messages.scss';

@connect(
  (state) => ({
    staticData: state.auth.staticData,
    user: state.auth.user,
  }),
  { ...commonActions }
)
export default class Messages extends Component {
  static propTypes = {
    staticData: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    getApplications: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      applications: [],
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh = () => this.props.getApplications('')
    .then(applications => this.setState({ applications }));

  onMessage = (application, event) => {
    this.setState({
      messageDialog: true,
      selectedApp: application || this.state.selectedApp,
    });
    if (event) {
      event.stopPropagation();
    }
  }

  onSend = () => {
    this.props.getApplications(`${this.state.selectedApp.id}/`)
      .then(selectedApp => {
        this.setState({ selectedApp });
        this.onRefresh();
      });
  }

  onDetail = () => {
    this.setState({
      messageDialog: false,
    });
  }

  dismissDialog = () => this.setState({
    selectedApp: null,
  });

  renderApplication = application => {
    const { staticData, user } = this.props;
    const job = application.job_data;
    const jobFullName = utils.getJobFullName(job);
    const jobSeeker = application.job_seeker;
    let name;
    let img;
    let comment;
    if (user.job_seeker) {
      img = utils.getJobLogo(job, true);
      name = job.title;
      comment = jobFullName;
    } else {
      img = utils.getJobSeekerImg(jobSeeker);
      name = utils.getJobSeekerFullName(jobSeeker);
      comment = `${job.title} (${jobFullName})`;
    }
    const lastMessage = application.messages[application.messages.length - 1];
    const userRole = staticData.roles.filter(item => item.id === lastMessage.from_role)[0];
    const msg = `${userRole.name === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const strDate = utils.getTimeString(new Date(lastMessage.created));

    const deletedStatus = utils.getItemByName(staticData.applicationStatuses, 'DELETED');
    const isDeleted = application.status === deletedStatus.id;

    return (
      <Link
        key={`${job.id}_${jobSeeker.id}`}
        className={[styles.itemContainer, (isDeleted ? styles.deleted : '')].join(' ')}
        onClick={() => this.onMessage(application)}
      >
        <img src={img} alt="" />
        <div className={styles.content} >
          <div className={styles.title}>
            <span>{name}</span>
            <div>{strDate}</div>
          </div>
          <div>
            <span>{comment}</span>
          </div>
          <div className={styles.description}>
            <span>{msg}</span>
          </div>
        </div>
      </Link>
    );
  };

  render() {
    const { applications, selectedApp, messageDialog } = this.state;
    const isJobSeeker = this.props.user.job_seeker;

    return (
      <div>
        <Helmet title="My Messages" />
        <div className="pageHeader">
          <h1>My Messages</h1>
          <button
            className="fa fa-refresh btn-icon"
            onClick={this.onRefresh}
          />
        </div>
        <div className="board">
          {
            applications.length === 0 && (
              <div className={styles.emptyContainer}>
                You have no applications.
              </div>
            )
          }
          { applications.map(this.renderApplication) }
        </div>
        {
          selectedApp && messageDialog &&
          <Message
            application={selectedApp}
            onSend={this.onSend}
            onClose={this.dismissDialog}
            onDetail={this.onDetail}
          />
        }
        {
          selectedApp && !messageDialog &&
          (
            isJobSeeker ?
              <JobDetail
                job={selectedApp.job_data}
                onClose={() => this.onMessage()}
              /> :
              <JobSeekerDetail
                application={selectedApp}
                jobSeeker={selectedApp.job_seeker}
                onClose={() => this.onMessage()}
              />
          )
        }
      </div>
    );
  }
}

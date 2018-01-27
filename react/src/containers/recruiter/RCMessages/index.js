import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import {
  Board,
  Loading,
  SearchBar,
  Logo,
  MessageThread,
  FlexBox,
  JobSelect,
  JobDetail,
  JobseekerDetail
} from 'components';

import * as helper from 'utils/helper';
import { getJobs } from 'redux/recruiter/jobs';
import {
  getMsgApplications,
  selectApplication,
  connectApplication,
  setShortlist,
  sendMessage
} from 'redux/applications';
import Wrapper from './Wrapper';

class RCMessages extends Component {
  state = {
    open: true
  };

  componentWillMount() {
    const appId = helper.str2int(this.props.match.params.appId);
    this.props.getJobs();
    this.props.getMsgApplications(appId);
  }

  onSend = message => this.props.sendMessage(message);

  onConnect = () => this.props.connectApplication(this.props.selectedApp.id);

  onSelectApplication = application => {
    this.setState({ open: false });
    this.props.selectApplication(application);
    this.props.history.push(`/recruiter/messages/${application.id}/`);
    helper.saveData('messages_app', application.id);
  };

  onSelectJob = filterJob => this.setState({ filterJob });

  onChangeFilterText = filterText => this.setState({ filterText });

  onToggleSidebar = () => this.setState({ open: !this.state.open });

  onShowJobDetail = showJobDetail => this.setState({ showJobDetail });

  onShowJobseekerDetail = showJSDetail => {
    const { selectedApp } = this.props;
    const status = helper.getNameByID('appStatuses', selectedApp.status);

    this.buttons = status === 'CREATED' && [
      {
        label: 'Connect',
        color: 'green',
        onClick: () => this.onConnect()
      }
      // {
      //   label: 'Remove',
      //   color: 'yellow',
      //   onClick: () => this.onRemove()
      // }
    ];
    this.setState({ showJSDetail });
  };

  renderApplications = () => {
    const { applications, errors } = this.props;

    if (applications.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">{!errors ? 'You have no applications.' : 'Server Error!'}</div>
        </FlexBox>
      );
    }

    const { filterJob, filterText } = this.state;
    const filteredApps = applications.filter(
      app =>
        (!filterJob || filterJob.id === app.job_data.id) &&
        (!filterText ||
          helper
            .getFullJSName(app.job_seeker)
            .toLowerCase()
            .indexOf(filterText) !== -1)
    );

    if (filteredApps.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            <i className="fa fa-search" />
            No search results
          </div>
        </FlexBox>
      );
    }

    return (
      <div className="app-list">
        {filteredApps.map(app => {
          const { id, job_data, messages, status, job_seeker } = app;
          const name = helper.getFullJSName(job_seeker);
          const image = helper.getJobseekerImg(job_seeker);
          const subTitle = job_data.title;
          const lastMessage = messages[messages.length - 1];
          const userRole = helper.getNameByID('roles', lastMessage.from_role);
          const comment = `${userRole === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
          const date = new Date(lastMessage.created);
          const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() - 2000}`;
          const deleted = helper.getNameByID('appStatuses', status) === 'DELETED' ? 'deleted' : '';
          const selected = id === (this.props.selectedApp || {}).id ? 'selected' : '';

          return (
            <a
              key={id}
              className={[selected, deleted, 'application'].join(' ')}
              onClick={() => this.onSelectApplication(app)}
            >
              <Logo src={image} size="50" className="logo" circle />
              <div className="content">
                <div>
                  <div className="name single-line">{name}</div>
                  <span className="date">{strDate}</span>
                </div>
                <div className="sub-title single-line">{subTitle}</div>
                <span className="single-line">{comment}</span>
              </div>
            </a>
          );
        })}
      </div>
    );
  };

  renderThreadHeader = () => {
    const { selectedApp } = this.props;
    const job = selectedApp.job_data;
    const headerTitle = helper.getFullJSName(selectedApp.job_seeker);
    const headerComment = `${job.title} (${helper.getFullBWName(job)})`;

    return (
      <div>
        <div>
          <a className="title" onClick={() => this.onShowJobseekerDetail(true)}>
            {headerTitle}
          </a>
        </div>
        <div>
          <a onClick={() => this.onShowJobDetail(true)}>{headerComment}</a>
        </div>
      </div>
    );
  };

  render() {
    const { jobs, applications, selectedApp } = this.props;
    const open = this.state.open ? 'open' : '';

    return (
      <Wrapper>
        <Helmet title="My Messages" />

        {jobs && applications ? (
          <Board block className={`board ${open}`}>
            <div className="mask" onClick={() => this.setState({ open: false })} />

            <div className="sidebar">
              <div className="job-list">
                <JobSelect
                  options={jobs}
                  placeholder="Filter by job"
                  value={(this.state.filterJob || {}).id}
                  onChange={this.onSelectJob}
                />
              </div>
              <SearchBar onChange={this.onChangeFilterText} />
              {this.renderApplications()}
            </div>

            <div className="thread-container">
              <div className="thread-header">
                <a className="toggle" onClick={this.onToggleSidebar}>
                  <i className="fa fa-bars fa-lg" />
                </a>
                {selectedApp && this.renderThreadHeader()}
              </div>

              {selectedApp && (
                <MessageThread
                  userRole="RECRUITER"
                  application={selectedApp}
                  onSend={this.onSend}
                  onConnect={this.onConnect}
                />
              )}
            </div>

            {this.state.showJobDetail && (
              <JobDetail job={selectedApp.job_data} onClose={() => this.onShowJobDetail()} />
            )}

            {this.state.showJSDetail && (
              <JobseekerDetail
                application={selectedApp}
                onChangeShortlist={this.props.setShortlist}
                jobseeker={selectedApp.job_seeker}
                onClose={() => this.onShowJobseekerDetail()}
                buttons={this.buttons}
              />
            )}
          </Board>
        ) : (
          <Loading />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobs: state.rc_jobs.jobs,
    applications: state.applications.applications,
    selectedApp: state.applications.selectedApp
  }),
  {
    getJobs,
    getMsgApplications,
    selectApplication,
    connectApplication,
    setShortlist,
    sendMessage
  }
)(RCMessages);

import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import { Loading, ItemList, LogoImage, JobDetail } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import JSThread from './JSThread';
import styles from './JSMessages.scss';

export default class JSMessages extends Component {

  constructor(props) {
    super(props);
    this.state = { sidebar: false };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.api.getApplications('').then(
      applications => {
        applications.sort((app1, app2) => {
          const date1 = new Date(app1.messages[app1.messages.length - 1].created);
          const date2 = new Date(app2.messages[app2.messages.length - 1].created);
          return date1.getTime() < date2.getTime();
        });

        const appid = parseInt(utils.getShared('messages_selected_id'), 10);
        if (appid !== 0 && !appid) {
          this.onSelectedApplication(applications[0]);
        } else {
          const application = applications.filter(app => app.id === appid)[0];
          this.onSelectedApplication(application);
        }

        this.setState({ applications });
      }
    );
  }

  onToggleSidebar = () => this.setState({ sidebar: !this.state.sidebar });

  onShowJobDetail = showJobDetail => this.setState({ showJobDetail });

  onSelectedApplication = selectedApp => {
    utils.setShared('messages_selected_id', (selectedApp || {}).id);
    this.setState({ selectedApp, sidebar: false });
  }

  onUpdateApplication = application => {
    let applications = this.state.applications;
    applications = applications.filter(app => app.id !== this.state.selectedApp.id);
    applications.push(application);
    applications.sort((app1, app2) => {
      const date1 = new Date(app1.messages[app1.messages.length - 1].created);
      const date2 = new Date(app2.messages[app2.messages.length - 1].created);
      return date1.getTime() < date2.getTime();
    });
    this.setState({ applications });
  }

  onFilter = (application, filterText) =>
  application.job_data.title.toLowerCase().indexOf(filterText) !== -1 ||
  utils.getJobFullName(application.job_data).toLowerCase().indexOf(filterText) !== -1;

  renderItem = application => {
    const job = application.job_data;
    const image = utils.getJobLogo(job);
    const name = job.title;
    const subTitle = utils.getJobFullName(job);
    const lastMessage = application.messages[application.messages.length - 1];
    const userRole = this.api.roles.filter(item => item.id === lastMessage.from_role)[0];
    const comment = `${userRole.name === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const date = new Date(lastMessage.created);
    const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    const deletedStatus = utils.getItemByName(this.api.applicationStatuses, 'DELETED');
    const deleted = application.status === deletedStatus.id ? 'disabled' : '';
    const selected = application.id === this.state.selectedApp.id ? 'selected' : '';

    return (
      <Link
        key={application.id}
        className={[styles.application, selected, deleted, 'list-item'].join(' ')}
        onClick={() => this.onSelectedApplication(application)}
      >
        <LogoImage image={image} size={50} />
        <div className="content">
          <div>
            <h5>{name}</h5>
            <span className={styles.date}>{strDate}</span>
          </div>
          <span className={styles.subTitle}>{subTitle}</span>
          <span className={styles.message}>{comment}</span>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <div>
      <span>You have no applications.</span>
    </div>
  );

  renderThread = () => {
    const { selectedApp } = this.state;
    const job = selectedApp.job_data;

    return (
      <div className={styles.threadContainer}>
        <div className={styles.threadHeader}>
          <button
            className="link-btn fa fa-angle-double-right"
            onClick={this.onToggleSidebar}
          />
          <div>
            <h4><Link onClick={() => this.onShowJobDetail(true)}>{job.title}</Link></h4>
            <div><Link onClick={() => this.onShowJobDetail(true)}>{utils.getJobFullName(job)}</Link></div>
          </div>
        </div>
        <JSThread
          className={styles.threadContent}
          application={selectedApp}
          onSend={this.onUpdateApplication}
        />
      </div>
    );
  }

  render() {
    const { applications, selectedApp, showJobDetail, sidebar } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="My Messages" />

        {
          applications ?
            <div className="board shadow">
              <div
                className={styles.sidebarController}
                style={{ display: sidebar ? 'block' : 'none' }}
              >
                <ItemList
                  className={styles.appList}
                  items={applications}
                  onFilter={this.onFilter}
                  renderItem={this.renderItem}
                  renderEmpty={this.renderEmpty}
                />
                <Link
                  className={styles.mask}
                  onClick={() => this.setState({ sidebar: false })}
                />
              </div>

              {
                selectedApp && this.renderThread()
              }
              {
                showJobDetail &&
                <JobDetail
                  job={selectedApp.job_data}
                  onClose={() => this.onShowJobDetail()}
                />
              }
            </div>
          :
            <Loading />
        }
      </div>
    );
  }
}

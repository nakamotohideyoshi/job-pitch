import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import Select from 'react-select';
import { Loading, ItemList, LogoImage } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import RThread from './RThread';
import styles from './RMessages.scss';


export default class RMessages extends Component {

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    Promise.all([this.api.getUserJobs(''), this.api.getApplications('')]).then(
      data => {
        const jobs = data[0];
        const applications = data[1];
        applications.sort((app1, app2) => {
          const date1 = new Date(app1.messages[app1.messages.length - 1].created);
          const date2 = new Date(app2.messages[app2.messages.length - 1].created);
          return date1.getTime() < date2.getTime();
        });

        const appid = parseInt(utils.getShared('messages_selected_id'), 10);
        if (appid !== 0 && !appid) {
          this.onSelectedApplication(applications[0]);
        } else {
          const selectedApp = applications.filter(app => app.id === appid)[0];
          this.onSelectedApplication(selectedApp);
        }

        this.setState({ jobs, applications });
      }
    );
  }

  onSelectedApplication = selectedApp => {
    utils.setShared('messages_selected_id', (selectedApp || {}).id);
    this.setState({ selectedApp });
  }

  onFilterByJob = filterJob => this.setState({
    filterJob
  });

  onFilter = (application, filterText) =>
    (!this.state.filterJob || this.state.filterJob.id === application.job_data.id) &&
    utils.getJobSeekerFullName(application.job_seeker).toLowerCase().indexOf(filterText) !== -1;

  renderItem = application => {
    const job = application.job_data;
    const jobSeeker = application.job_seeker;
    const image = utils.getJobSeekerImg(jobSeeker);
    const name = utils.getJobSeekerFullName(jobSeeker);
    const subTitle = job.title;
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

  render() {
    const { applications } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="My Messages" />

        {
          applications ?
            <div className="board shadow">
              <div className={styles.leftSide}>
                <div className={styles.jobFilter}>
                  <Select
                    valueKey="id"
                    labelKey="title"
                    placeholder="Filter by job"
                    value={this.state.filterJob}
                    options={this.state.jobs}
                    onChange={this.onFilterByJob}
                  />
                </div>
                <ItemList
                  className={styles.appList}
                  items={applications}
                  onFilter={this.onFilter}
                  renderItem={this.renderItem}
                  renderEmpty={this.renderEmpty}
                />
              </div>
              <RThread application={this.state.selectedApp} />
            </div>
          :
            <Loading />
        }
      </div>
    );
  }
}

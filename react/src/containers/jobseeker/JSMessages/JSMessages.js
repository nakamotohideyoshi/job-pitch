import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import { Loading, ItemList } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import Thread from './JSThread';
import styles from './JSMessages.scss';

export default class JSMessages extends Component {

  constructor(props) {
    super(props);
    this.state = { };
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

  onSelectedApplication = selectedApp => {
    utils.setShared('messages_selected_id', (selectedApp || {}).id);
    this.setState({ selectedApp });
  }

  // onSend = () => {
  //   this.props.getApplications(`${this.state.selectedApp.id}/`)
  //     .then(selectedApp => {
  //       this.setState({ selectedApp });
  //       this.onRefresh();
  //     });
  // }

  // onDetail = () => {
  //   this.setState({
  //     messageDialog: false,
  //   });
  // }

  // dismissDialog = () => this.setState({
  //   selectedApp: null,
  // });

  onFilter = (application, filterText) =>
  application.job_data.title.toLowerCase().indexOf(filterText) !== -1 ||
  utils.getJobFullName(application.job_data).toLowerCase().indexOf(filterText) !== -1;

  renderItem = application => {
    const job = application.job_data;
    const image = utils.getJobLogo(job, true);
    const name = job.title;
    const subTitle = utils.getJobFullName(job);
    const lastMessage = application.messages[application.messages.length - 1];
    const userRole = this.api.roles.filter(item => item.id === lastMessage.from_role)[0];
    const comment = `${userRole.name === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const date = new Date(lastMessage.created);
    const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    const deletedStatus = utils.getItemByName(this.api.applicationStatuses, 'DELETED');
    const deleted = application.status === deletedStatus.id ? styles.deleted : '';
    const selected = application.id === this.state.selectedApp.id ? styles.selected : '';

    return (
      <Link
        key={application.id}
        className={[styles.application, deleted, selected].join(' ')}
        onClick={() => this.onSelectedApplication(application)}
      >
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.name}>
              <div>{name}</div>
              <span>{strDate}</span>
            </div>
            <div className={styles.subTitle}>{subTitle}</div>
            <div className={styles.message}>{comment}</div>
          </div>
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
    const { applications, selectedApp } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="My Messages" />

        {
          applications ?
            <div className="board-shadow">
              <ItemList
                className={styles.appList}
                items={applications}
                onFilter={this.onFilter}
                renderItem={this.renderItem}
                renderEmpty={this.renderEmpty}
              />
              <Thread
                application={selectedApp}
              />
            </div>
          :
            <Loading />
        }
      </div>
    );
  }
}

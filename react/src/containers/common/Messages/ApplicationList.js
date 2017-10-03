import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { ItemList } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './ApplicationList.scss';

export default class ApplicationList extends Component {
  static propTypes = {
    applications: PropTypes.array,
    selectedApp: PropTypes.object,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    applications: null,
    selectedApp: {},
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.api = ApiClient.shared();
  }

  onFilter = (application, filterText) => {
    if (this.api.user.job_seeker) {
      return application.job_data.title.toLowerCase().indexOf(filterText) !== -1 ||
        utils.getJobFullName(application.job_data).toLowerCase().indexOf(filterText) !== -1;
    }
    return utils.getJobSeekerFullName(application.job_seeker).toLowerCase().indexOf(filterText) !== -1;
  };

  renderItem = application => {
    const job = application.job_data;
    const jobSeeker = application.job_seeker;
    let name;
    let image;
    let subTitle;
    if (this.api.user.job_seeker) {
      image = utils.getJobLogo(job, true);
      name = job.title;
      subTitle = utils.getJobFullName(job);
    } else {
      image = utils.getJobSeekerImg(jobSeeker);
      name = utils.getJobSeekerFullName(jobSeeker);
      subTitle = job.title;
    }
    const lastMessage = application.messages[application.messages.length - 1];
    const userRole = this.api.roles.filter(item => item.id === lastMessage.from_role)[0];
    const comment = `${userRole.name === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const date = new Date(lastMessage.created);
    const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    const deletedStatus = utils.getItemByName(this.api.applicationStatuses, 'DELETED');
    const deleted = application.status === deletedStatus.id ? styles.deleted : '';
    const selected = application.id === this.props.selectedApp.id ? styles.selected : '';

    return (
      <Link
        key={application.id}
        className={[styles.application, deleted, selected].join(' ')}
        onClick={() => this.props.parent.onSelectedApplication(application)}
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
    return (
      <ItemList
        className={styles.root}
        items={this.props.applications}
        onFilter={this.onFilter}
        renderItem={this.renderItem}
        renderEmpty={this.renderEmpty}
      />
    );
  }
}

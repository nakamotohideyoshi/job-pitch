import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
// import { Message, JobSeekerDetail, JobDetail } from 'components';
import { ItemList } from 'components';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './ApplicationList.scss';

@connect(
  () => ({
  }),
  { ...apiActions }
)
export default class ApplicationList extends Component {
  static propTypes = {
    getApplicationsAction: PropTypes.func.isRequired,
    selectedApplication: PropTypes.object,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    selectedApplication: null,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.getApplicationsAction('')
    .then(applications => {
      this.setState({ applications });
      if (applications.length > 0) {
        this.props.parent.onSelectedApplication(applications[0]);
      }
    });
  }

  onFilter = (application, filterText) => {
    if (ApiClient.user.job_seeker) {
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
    if (ApiClient.user.job_seeker) {
      image = utils.getJobLogo(job, true);
      name = job.title;
      subTitle = utils.getJobFullName(job);
    } else {
      image = utils.getJobSeekerImg(jobSeeker);
      name = utils.getJobSeekerFullName(jobSeeker);
      subTitle = job.title;
    }
    const lastMessage = application.messages[application.messages.length - 1];
    const userRole = ApiClient.roles.filter(item => item.id === lastMessage.from_role)[0];
    const comment = `${userRole.name === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const date = new Date(lastMessage.created);
    const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    const deletedStatus = utils.getItemByName(ApiClient.applicationStatuses, 'DELETED');
    const deleted = application.status === deletedStatus.id ? styles.deleted : '';
    const { selectedApplication } = this.props;
    const selected = selectedApplication && application.id === selectedApplication.id ? styles.selected : '';

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
        items={this.state.applications}
        onFilter={this.onFilter}
        renderItem={this.renderItem}
        renderEmpty={this.renderEmpty}
      />
    );
  }
}

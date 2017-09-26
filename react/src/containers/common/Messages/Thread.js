import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Textarea from 'react-textarea-autosize';
import { Loading } from 'components';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './Thread.scss';

@connect(
  () => ({
  }),
  { ...apiActions }
)
export default class Thread extends Component {
  static propTypes = {
    application: PropTypes.object,
    sendMessageAction: PropTypes.func.isRequired,
    saveApplicationAction: PropTypes.func.isRequired,
    onSend: PropTypes.func,
  }

  static defaultProps = {
    onSend: () => {},
    application: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      message: '',
      messages: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.application || this.application.id !== nextProps.application) {
      this.application = nextProps.application;
      const jobSeeker = this.application.job_seeker;
      const job = this.application.job_data;
      const jobSeekerImg = utils.getJobSeekerImg(jobSeeker);
      const jobLogo = utils.getJobLogo(job, true);
      if (ApiClient.user.job_seeker) {
        this.myAvatar = jobSeekerImg;
        this.yourAvatar = jobLogo;
        this.yourName = job.title;
        this.yourComment = utils.getJobFullName(job);
      } else {
        this.myAvatar = jobLogo;
        this.yourAvatar = jobSeekerImg;
        this.yourName = utils.getJobSeekerFullName(jobSeeker);
        this.yourComment = '';
      }
      this.scrollBottom(this.scrollObject);
    }
  }

  onChnage = e => {
    this.setState({
      message: e.target.value
    });
  }

  onSend = () => {
    const { sendMessageAction, application, onSend } = this.props;
    const message = this.state.message.trim();
    if (message !== '') {
      sendMessageAction({
        application: application.id,
        content: message,
      }).then(() => {
        this.setState({ message: '' });
        this.getMessages();
        onSend();
      });
    }
  }

  onConnect = () => {
    const { saveApplicationAction, application, onSend } = this.props;
    saveApplicationAction({
      id: application.id,
      connect: utils.getItemByName(ApiClient.applicationStatuses, 'ESTABLISHED').id,
    })
    .then(() => {
      utils.successNotif('Success!');
      this.getMessages();
      onSend();
    });
  }

  // getMessages = () => {
  //   this.props.getApplicationsAction(`${this.props.application.id}/`)
  //   .then(application => {
  //     this.setState({ messages: application.messages });
  //   });
  // }

  scrollBottom = ref => {
    if (ref) {
      setTimeout(() => {
        this.scrollObject = ref;
        this.scrollObject.scrollTop = this.scrollObject.scrollHeight;
      }, 100);
    }
  }

  You = ({ message }) => {
    const { content, created } = message;
    const strDate = utils.getTimeString(new Date(created));
    return (
      <div className={styles.you}>
        <img src={this.yourAvatar} alt="" />
        <div>
          <div className={styles.bubble}>{content}</div>
          <div className={styles.time}>{strDate}</div>
        </div>
      </div>
    );
  };

  Me = ({ message }) => {
    const { content, created } = message;
    const strDate = utils.getTimeString(new Date(created));
    return (
      <div className={styles.me}>
        <div>
          <div className={styles.bubble}>{content}</div>
          <div className={styles.time}>{strDate}</div>
        </div>
        <img src={this.myAvatar} alt="" />
      </div>
    );
  };

  InputComponent = () => {
    if (this.application.status === utils.getApplicationStatusByName('DELETED').id) {
      return (
        <div className={styles.input}>
          <div className={styles.input}>
            This appliction has been deleted.
          </div>
        </div>
      );
    }

    if (this.application.status !== utils.getApplicationStatusByName('CREATED').id) {
      return (
        <div className={styles.input}>
          <Textarea
            maxRows={15}
            placeholder="Type a message here"
            value={this.state.message}
            onChange={this.onChnage}
          />
          <Button
            onClick={this.onSend}
          >Send</Button>
        </div>
      );
    }

    if (ApiClient.user.job_seeker) {
      return (
        <div className={styles.input}>
          <div className={styles.input}>
            You cannot send messages until your application is accepted
          </div>
          <Button
            bsStyle="success"
          >Ok</Button>
        </div>
      );
    }

    return (
      <div className={styles.input}>
        <div className={styles.input}>
          You cannot send messages until you have connected
        </div>
        <Button
          bsStyle="success"
          onClick={this.onConnect}
        >Connect</Button>
      </div>
    );
  }

  render() {
    if (!this.application) {
      return <div></div>;
    }

    const { application } = this.props;

    if (application) {
      if (ApiClient.user.job_seeker) {
        const job = application.job_data;
        this.headerTitle = job.title;
        this.headerComment = utils.getJobFullName(job);
      } else {
        this.headerTitle = utils.getJobSeekerFullName(application.job_seeker);
        this.headerComment = '';
      }
    } else {
      this.headerTitle = '';
      this.headerComment = '';
    }

    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <h4>{this.headerTitle}</h4>
          <div>{this.headerComment}</div>
        </div>
        <div className={styles.content} ref={this.scrollBottom}>
          {
            this.application.messages.map(item => {
              const userRole = ApiClient.roles.filter(role => role.id === item.from_role)[0].name;
              if ((ApiClient.user.job_seeker && userRole === 'JOB_SEEKER') ||
                (!ApiClient.user.job_seeker && userRole === 'RECRUITER')) {
                return <this.Me key={item.id} message={item} />;
              }
              return <this.You key={item.id} message={item} />;
            })
          }
        </div>
        <this.InputComponent />
      </div>
    );
  }
}

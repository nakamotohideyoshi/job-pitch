import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Textarea from 'react-textarea-autosize';
import { JobSeekerDetail, JobDetail, LogoImage } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './RThread.scss';

export default class RThread extends Component {
  static propTypes = {
    application: PropTypes.object,
    onSend: PropTypes.func,
  }

  static defaultProps = {
    application: null,
    onSend: () => {},
  }

  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: null,
    };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.setApplication(this.props.application);
  }

  componentWillReceiveProps(nextProps) {
    this.setApplication(nextProps.application);
  }

  onShowJobSeekerDetail = showJobSeekerDetail => this.setState({
    showJobSeekerDetail
  });

  onShowJobDetail = showJobDetail => this.setState({
    showJobDetail
  });

  onChnageInput = e => this.setState({
    message: e.target.value
  });

  onSend = () => {
    const { application, onSend } = this.props;
    const message = this.state.message.trim();

    this.setState({ message: '' });

    this.api.sendMessage({
      application: application.id,
      content: message,
    }).then(() => {
      this.getMessages();
      onSend();
    });
  }

  onConnect = () => {
    const { application, onSend } = this.props;
    this.api.saveApplication({
      id: application.id,
      connect: utils.getApplicationStatusByName('ESTABLISHED').id,
    })
    .then(() => {
      utils.successNotif('Success!');
      // this.getMessages();
      // onSend();
    });
  }

  setApplication = application => {
    if (this.state.application && this.state.application.id === application.id) {
      return;
    }

    this.setState({ application });

    if (application) {
      const job = application.job_data;
      const jobSeeker = application.job_seeker;
      const jobSeekerName = utils.getJobSeekerFullName(jobSeeker);

      this.headerTitle = jobSeekerName;
      this.headerComment = `${job.title} (${utils.getJobFullName(job)})`;
      this.yourAvatar = utils.getJobSeekerImg(jobSeeker);
      this.myAvatar = utils.getJobLogo(job);

      this.scrollBottom(this.scrollContainer);
    }
  }

  // getMessages = () => {
  //   this.api.getApplications(`${this.props.application.id}/`)
  //   .then(application => {
  //     this.setState({ messages: application.messages });
  //   });
  // }

  scrollBottom = ref => {
    if (ref) {
      setTimeout(() => {
        this.scrollContainer = ref;
        this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
      }, 100);
    }
  }

  You = ({ message }) => {
    const { content, created } = message;
    const strDate = utils.getTimeString(new Date(created));
    return (
      <div className={styles.you}>
        <LogoImage image={this.yourAvatar} size={40} />
        <div className={styles.message}>
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
        <div className={styles.message}>
          <div className={styles.bubble}>{content}</div>
          <div className={styles.time}>{strDate}</div>
        </div>
        <LogoImage image={this.myAvatar} size={40} />
      </div>
    );
  };

  InputComponent = () => {
    const { application, message } = this.state;

    if (application.status === utils.getApplicationStatusByName('DELETED').id) {
      return (
        <div className={styles.input}>
          <Textarea
            placeholder="This appliction has been deleted"
            disabled
          />
        </div>
      );
    }

    if (application.status !== utils.getApplicationStatusByName('CREATED').id) {
      return (
        <div className={styles.input}>
          <Textarea
            maxRows={15}
            placeholder="Type a message here"
            value={message}
            onChange={this.onChnageInput}
          />
          <Button
            disabled={message.trim() === ''}
            onClick={this.onSend}
          >Send</Button>
        </div>
      );
    }

    return (
      <div className={styles.input}>
        <Textarea
          placeholder="You cannot send messages until you have connected"
          disabled
        />
        <Button
          bsStyle="success"
          onClick={this.onConnect}
        >Connect</Button>
      </div>
    );
  }

  render() {
    const { application } = this.state;

    if (!application) {
      return <div></div>;
    }

    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <h4><Link onClick={() => this.onShowJobSeekerDetail(true)}>{this.headerTitle}</Link></h4>
          <div><Link onClick={() => this.onShowJobDetail(true)}>{this.headerComment}</Link></div>
        </div>

        <div className={styles.content} ref={this.scrollBottom}>
          {
            application.messages.map(item => {
              const userRole = this.api.roles.filter(role => role.id === item.from_role)[0].name;
              if (userRole === 'RECRUITER') {
                return <this.Me key={item.id} message={item} />;
              }
              return <this.You key={item.id} message={item} />;
            })
          }
        </div>
        <this.InputComponent />

        {
          this.state.showJobSeekerDetail &&
          <JobSeekerDetail
            jobSeeker={application.job_seeker}
            application={application}
            onClose={() => this.onShowJobSeekerDetail()}
          />
        }
        {
          this.state.showJobDetail &&
          <JobDetail
            job={application.job_data}
            onClose={() => this.onShowJobDetail()}
          />
        }
      </div>
    );
  }
}

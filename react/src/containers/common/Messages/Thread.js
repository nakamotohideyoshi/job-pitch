import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Textarea from 'react-textarea-autosize';
import { JobSeekerDetail, JobDetail } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './Thread.scss';

export default class Thread extends Component {
  static propTypes = {
    application: PropTypes.object,
    onSend: PropTypes.func,
    parent: PropTypes.object.isRequired,
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

  onDetail = showDetail => this.setState({ showDetail });

  onChnageInput = e => {
    this.setState({
      message: e.target.value
    });
  }

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
      const jobSeeker = application.job_seeker;
      const job = application.job_data;
      const jobSeekerImg = utils.getJobSeekerImg(jobSeeker);
      const jobLogo = utils.getJobLogo(job, true);

      if (this.api.user.job_seeker) {
        this.headerTitle = job.title;
        this.headerComment = utils.getJobFullName(job);
        this.myAvatar = jobSeekerImg;
        this.yourAvatar = jobLogo;
        this.yourName = job.title;
        this.yourComment = utils.getJobFullName(job);
      } else {
        this.headerTitle = utils.getJobSeekerFullName(application.job_seeker);
        this.headerComment = '';
        this.myAvatar = jobLogo;
        this.yourAvatar = jobSeekerImg;
        this.yourName = utils.getJobSeekerFullName(jobSeeker);
        this.yourComment = '';
      }

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

    if (this.api.user.job_seeker) {
      return (
        <div className={styles.input}>
          <Textarea
            placeholder="You cannot send messages until your application is accepted"
            disabled
          />
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
          <h4><Link onClick={() => this.onDetail(true)}>{this.headerTitle}</Link></h4>
          <div><Link onClick={() => this.onDetail(true)}>{this.headerComment}</Link></div>
        </div>

        <div className={styles.content} ref={this.scrollBottom}>
          {
            application.messages.map(item => {
              const userRole = this.api.roles.filter(role => role.id === item.from_role)[0].name;
              if ((this.api.user.job_seeker && userRole === 'JOB_SEEKER') ||
                (!this.api.user.job_seeker && userRole === 'RECRUITER')) {
                return <this.Me key={item.id} message={item} />;
              }
              return <this.You key={item.id} message={item} />;
            })
          }
        </div>
        <this.InputComponent />

        {
          this.state.showDetail &&
          (
            this.api.user.job_seeker ?
              <JobDetail
                job={application.job_data}
                onClose={() => this.onDetail(false)}
              /> :
              <JobSeekerDetail
                jobSeeker={application.job_seeker}
                application={application}
                onClose={() => this.onDetail()}
              />
          )
        }
      </div>
    );
  }
}

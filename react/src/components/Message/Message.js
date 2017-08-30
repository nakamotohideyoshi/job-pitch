import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import { Loading } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Message.scss';

@connect(
  (state) => ({
    user: state.auth.user,
    staticData: state.auth.staticData,
  }),
  { ...commonActions }
)
export default class Message extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    staticData: PropTypes.object.isRequired,
    application: PropTypes.object.isRequired,
    sendMessage: PropTypes.func.isRequired,
    saveApplication: PropTypes.func.isRequired,
    getApplications: PropTypes.func.isRequired,
    onSend: PropTypes.func,
    onClose: PropTypes.func.isRequired,
  }

  static defaultProps = {
    onSend: () => {}
  }

  constructor(props) {
    super(props);

    this.state = {
      message: '',
      messages: null,
    };

    const { application } = this.props;
    const jobSeeker = application.job_seeker;
    const job = application.job_data;
    const jobSeekerImg = utils.getJobSeekerImg(jobSeeker);
    const jobLogo = utils.getJobLogo(job, true);
    if (this.props.user.job_seeker) {
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
  }

  componentDidMount() {
    this.getMessages();
  }

  onChnage = e => {
    this.setState({
      message: e.target.value
    });
  }

  onSend = () => {
    const { sendMessage, application, onSend } = this.props;
    const message = this.state.message.trim();
    if (message !== '') {
      sendMessage({
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
    const { saveApplication, staticData, application, onSend } = this.props;
    saveApplication({
      id: application.id,
      connect: utils.getItemByName(staticData.applicationStatuses, 'ESTABLISHED').id,
    })
    .then(() => {
      utils.successNotif('Success!');
      this.getMessages();
      onSend();
    });
  }

  getMessages = () => {
    this.props.getApplications(`${this.props.application.id}/`)
    .then(application => {
      this.setState({ messages: application.messages });
    });
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
    const { staticData, user, application, onClose } = this.props;
    if (application.status !== utils.getItemByName(staticData.applicationStatuses, 'CREATED').id) {
      return (
        <div className={styles.input}>
          <textarea
            placeholder="Type a message here"
            value={this.state.message}
            onChange={this.onChnage}
          />
          <button
            className="btn-icon"
            onClick={this.onSend}
          >Send</button>
        </div>
      );
    }

    if (user.job_seeker) {
      return (
        <div className={styles.input}>
          <div className={styles.input}>
            You cannot send messages until your application is accepted
          </div>
          <Button
            bsStyle="success"
            onClick={onClose}
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
    const { staticData, user, onClose } = this.props;
    return (
      <Modal show onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
          <div className={styles.header}>
            <img src={this.yourAvatar} alt="" />
            <div>
              <h4>{this.yourName}</h4>
              <div className={styles.comment}>{this.yourComment}</div>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className={styles.container}>
          {
            this.state.messages ?
              <div className={styles.content}>
                {
                  this.state.messages.map(item => {
                    const userRole = staticData.roles.filter(role => role.id === item.from_role)[0].name;
                    if ((user.job_seeker && userRole === 'JOB_SEEKER') ||
                      (!user.job_seeker && userRole === 'RECRUITER')) {
                      return <this.Me key={item.id} message={item} />;
                    }
                    return <this.You key={item.id} message={item} />;
                  })
                }
              </div> :
              <Loading
                style={{
                  height: '200px',
                  position: 'initial',
                  display: 'flex',
                  alignItems: 'center'
                }} />
          }
        </Modal.Body>

        <Modal.Footer>
          <this.InputComponent />
        </Modal.Footer>
      </Modal>
    );
  }
}

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Input, Avatar } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { sendMessageAction, readMessageAction } from 'redux/applications';
import { Icons } from 'components';
import Wrapper from './MessageThread.styled';

const { TextArea } = Input;

class MessageThread extends React.Component {
  state = {
    message: ''
  };

  componentDidMount() {
    this.scrollBottom();
    this.readMessages(this.props.application);
  }

  componentWillReceiveProps(nextProps) {
    const app = this.props.application;
    const nextApp = nextProps.application;
    if (app.id !== nextApp.id) {
      this.setState({ message: '' });
      this.scrollBottom();
      this.readMessages(nextApp);
    } else {
      if (app.messages.length !== nextApp.messages.length) {
        this.scrollBottom();
      }
      if (app.newMsgs !== nextApp.newMsgs) {
        this.readMessages(nextApp);
      }
    }
  }

  readMessages = application => {
    if (!application.newMsgs) return;

    const msg = application.messages.slice(-1)[0];
    this.props.readMessageAction({
      appId: application.id,
      id: msg.id,
      data: {
        read: true
      }
    });
  };

  onChnageInput = e => this.setState({ message: e.target.value });

  onSend = () => {
    const { id } = this.props.application;
    const message = this.state.message.trim();
    this.setState({ message: '' });
    this.scrollBottom(true);
    this.props.sendMessageAction({
      appId: id,
      data: {
        application: id,
        content: message
      }
    });
  };

  onKeyUp = event => {
    if (event.key === 'Enter' && event.ctrlKey) {
      this.onSend();
    }
  };

  scrollBottom = smooth =>
    setTimeout(() => {
      if (this.containerRef) {
        if (smooth) {
          this.containerRef.scroll({
            top: this.containerRef.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          this.containerRef.scrollTop = this.containerRef.scrollHeight;
        }
      }
    });

  renderMessage = ({ id, content, from_role, created }) => {
    const { application, showInterview } = this.props;
    const me = DATA.userRole === from_role;

    let avatar;
    if ((DATA.isRecruiter && me) || (DATA.isJobseeker && !me)) {
      avatar = helper.getJobLogo(application.job_data);
    } else {
      avatar = helper.getAvatar(application.job_seeker);
    }

    const comment = new Date(created).toLocaleTimeString('en-us', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let msg = content;
    const { interview } = application;
    if (interview) {
      const { messages } = interview;
      if (messages[messages.length - 1].id === id) {
        msg = (
          <div>
            {`Interview\n${content}`}
            <div
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={showInterview}
            >{`Interview: ${moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}`}</div>
          </div>
        );
      }
    }

    return (
      <div key={id} className={me ? 'me' : 'you'}>
        {!me && <Avatar src={avatar} />}
        <div className="message">
          <div className="bubble">{msg}</div>
          <div className="time">{comment}</div>
        </div>
        {me && <Avatar src={avatar} />}
      </div>
    );
  };

  renderInput = () => {
    const { application } = this.props;
    const { message } = this.state;

    if (application.status === DATA.APP.DELETED) {
      return <div>This application has been deleted</div>;
    }

    return (
      this.props.inputRenderer(application) || (
        <Fragment>
          <TextArea
            placeholder="Type a message here"
            autosize={{ minRows: 1, maxRows: 15 }}
            value={message}
            onChange={this.onChnageInput}
            onKeyUp={this.onKeyUp}
          />
          <Icons.PaperPlane size="lg" className={message.trim() === '' ? 'disabled' : ''} onClick={this.onSend} />
        </Fragment>
      )
    );
  };

  render() {
    return (
      <Wrapper>
        <div
          className="messages"
          ref={ref => {
            if (!this.containerRef) {
              this.containerRef = ref;
            }
          }}
        >
          {this.props.application.messages.map(this.renderMessage)}
        </div>

        <div className="input">{this.renderInput()}</div>
      </Wrapper>
    );
  }
}

MessageThread.propTypes = {
  sendMessageAction: PropTypes.func.isRequired,
  readMessageAction: PropTypes.func.isRequired,
  application: PropTypes.object,
  inputRenderer: PropTypes.func.isRequired,
  showInterview: PropTypes.func.isRequired
};

MessageThread.defaultProps = {
  application: null
};

export default connect(
  null,
  {
    sendMessageAction,
    readMessageAction
  }
)(MessageThread);

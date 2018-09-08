import React, { Fragment } from 'react';
import { Input, Avatar } from 'antd';
import { connect } from 'react-redux';

import { sendMessage, readMessage } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { Icons } from 'components';
import Wrapper from './styled';

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
    this.props.readMessage({
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
    this.props.sendMessage({
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
    const { application } = this.props;
    const me = helper.getNameByID('roles', from_role) === DATA.userRole;

    let avatar;
    if ((DATA.userRole === 'RECRUITER' && me) || (DATA.userRole === 'JOB_SEEKER' && !me)) {
      avatar = helper.getJobLogo(application.job_data);
    } else {
      avatar = helper.getPitch(application.job_seeker).thumbnail;
    }

    const comment = new Date(created).toLocaleTimeString('en-us', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div key={id} className={me ? 'me' : 'you'}>
        {!me && <Avatar src={avatar} />}
        <div className="message">
          <div className="bubble">{content}</div>
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
          <Icons.Send size="lg" className={message.trim() === '' ? 'disabled' : ''} onClick={this.onSend} />
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

export default connect(null, {
  sendMessage,
  readMessage
})(MessageThread);

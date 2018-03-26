import React, { Component } from 'react';
import { Button } from 'antd';
// import Textarea from 'react-textarea-autosize';

import * as helper from 'utils/helper';
import Logo from '../tags/Logo';
import Wrapper from './Wrapper';

export default class RThread extends Component {
  state = {
    message: ''
  };

  componentWillReceiveProps(nextProps) {
    if ((nextProps.application || {}).id !== (this.props.application || {}).id) {
      this.setState({ message: '' });
    }
  }

  onChnageInput = e => this.setState({ message: e.target.value });

  onSend = () => {
    const message = this.state.message.trim();
    this.setState({ message: '' });
    this.props.onSend(message);
    this.scrollBottom();
  };

  scrollBottom = () => {
    setTimeout(() => {
      if (this.contentRef) {
        this.contentRef.scrollTop = this.contentRef.scrollHeight;
      }
    }, 0);
  };

  renderMessage = (info, index) => {
    const { content, created, from_role } = info;
    const { application, userRole } = this.props;
    const me = !created || helper.getNameByID('roles', from_role) === userRole;

    let avatar;
    if ((me && userRole === 'RECRUITER') || (!me && userRole !== 'RECRUITER')) {
      avatar = helper.getJobLogo(application.job_data);
    } else {
      avatar = helper.getPitch(application.job_seeker);
    }

    let comment;
    if (created) {
      comment = new Date(created).toLocaleTimeString('en-us', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      comment = 'sending...';
    }

    return (
      <div key={index} className={me ? 'me' : 'you'}>
        {!me && <Logo src={avatar} size="40" className="avatar" circle />}
        <div className="message">
          <div className="bubble">{content}</div>
          <div className="time">{comment}</div>
        </div>
        {me && <Logo src={avatar} size="40" className="avatar" circle />}
      </div>
    );
  };

  renderInput = () => {
    const { application, userRole, onConnect } = this.props;

    const status = helper.getNameByID('appStatuses', application.status);
    if (status === 'DELETED') {
      return (
        <div className="input">
          {/* <Textarea placeholder="This application has been deleted" value="" disabled /> */}
        </div>
      );
    }

    if (status === 'ESTABLISHED') {
      const { message } = this.state;

      return (
        <div className="input">
          <Button color="green" disabled={message.trim() === ''} onClick={this.onSend}>
            Send
          </Button>
          {/* <Textarea placeholder="Type a message here" maxRows={15} value={message} onChange={this.onChnageInput} /> */}
        </div>
      );
    }

    const placeholders = {
      RECRUITER: 'You cannot send messages until you have connected',
      JOB_SEEKER: 'You cannot send message until your application is accepted'
    };

    return (
      <div className="input">
        {onConnect && (
          <Button color="green" onClick={onConnect}>
            Connect
          </Button>
        )}
        {/* <Textarea placeholder={placeholders[userRole]} value="" disabled /> */}
      </div>
    );
  };

  render() {
    return (
      <Wrapper>
        <div
          className="messages"
          ref={ref => {
            if (!this.contentRef) {
              this.contentRef = ref;
              this.scrollBottom();
            }
          }}
        >
          {this.props.application.messages.map((info, index) => this.renderMessage(info, index))}
        </div>

        {this.renderInput()}
      </Wrapper>
    );
  }
}

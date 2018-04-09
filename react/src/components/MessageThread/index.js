import React, { Fragment } from 'react';
import { Input, Avatar } from 'antd';

import * as helper from 'utils/helper';
import DATA from 'utils/data';

import { Icons, LinkButton } from 'components';
import Wrapper from './styled';

const { TextArea } = Input;

export default class MessageThread extends React.Component {
  state = {
    message: ''
  };

  componentWillReceiveProps(nextProps) {
    if ((nextProps.application || {}).id !== (this.props.application || {}).id) {
      this.setState({ message: '' });
      this.scrollBottom();
    }
  }

  onChnageInput = e => this.setState({ message: e.target.value });

  onSend = () => {
    const message = this.state.message.trim();
    this.setState({ message: '' });
    this.scrollBottom(true);
    this.props.onSend(message);
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

  renderMessage = ({ id, content, created, from_role }) => {
    const { application, userRole } = this.props;
    const me = !created || helper.getNameByID('roles', from_role) === userRole;

    let avatar;
    if ((userRole === 'RECRUITER' && me) || (userRole === 'JOBSEEKER' && !me)) {
      avatar = helper.getJobLogo(application.job_data);
    } else {
      avatar = helper.getPitch(application.job_seeker).thumbnail;
    }

    let comment = 'sending...';
    if (created) {
      comment = new Date(created).toLocaleTimeString('en-us', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

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
    const { application: { status }, userRole, onConnect } = this.props;

    if (status === DATA.APP.ESTABLISHED) {
      const { message } = this.state;
      return (
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
      );
    }

    if (status === DATA.APP.DELETED) {
      return <div>This application has been deleted</div>;
    }

    const info = {
      RECRUITER: {
        label: 'You cannot send messages until you have connected. ',
        link: 'Connect'
      },
      JOBSEEKER: {
        label: 'You cannot send message until your application is accepted. ',
        link: 'Apply'
      }
    };
    const { label, link } = info[userRole];
    return (
      <Fragment>
        <div>
          {label}
          {onConnect && <LinkButton onClick={onConnect}>{link}</LinkButton>}
        </div>
      </Fragment>
    );
  };

  render() {
    return (
      <Wrapper>
        <div
          className="messages"
          ref={ref => {
            this.containerRef = ref;
            this.scrollBottom();
          }}
        >
          {this.props.application.messages.map(this.renderMessage)}
        </div>

        <div className="input">{this.renderInput()}</div>
      </Wrapper>
    );
  }
}

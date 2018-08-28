import React from 'react';
import { connect } from 'react-redux';
import { saveInterview, changeInterview, removeInterview } from 'redux/interviews';
import { Form, Input, Button, DatePicker, Divider, Row, Col, notification, Modal, Checkbox } from 'antd';

import styled from 'styled-components';
import media from 'utils/mediaquery';

import Wrapper from './InterviewEdit.styled';

import * as helper from 'utils/helper';
import moment from 'moment';

import { updateMessageByInterview } from 'redux/applications';

const { Item } = Form;
const { TextArea } = Input;
const { confirm } = Modal;

const FormWrapper = styled(Form)`
  max-width: 700px;
  width: 100%;
  .btn-save {
    width: 100px;
  }

  .ant-btn + .ant-btn {
    margin-left: 20px;
    width: 100px;
  }

  ${media.mobile`
    .ant-form-item:first-child {
      .ant-form-item-label {
        display: inline-block;
        width: 50px;
        padding-bottom: 5px;
      }
      .ant-form-item-control-wrapper {
        display: inline-block;
        width: calc(100% - 50px);
      }
    }
  `};

  ${media.notmobile`
    .ant-form-item {
      .ant-form-item-label {
        width: 210px;
        vertical-align: top;
      }

      .ant-form-item-control-wrapper {
        display: inline-block;
        width: calc(100% - 210px);
      }
    }
  `};
`;

class InterviewEdit extends React.Component {
  state = {
    loading: null,
    view: false,
    create: false,
    editNoteOnly: false,
    completeModalVisible: false,
    ignoreFBCO: false,
    completeApp: null,
    feedbackComplete: '',
    cancelModalVisible: false,
    ignoreFBCA: false,
    cancelApp: null,
    feedbackCancel: ''
  };

  componentDidMount() {
    const { application, form, view, create } = this.props;
    const interview = application.interview;

    if (interview && !create) {
      form.setFieldsValue({
        at: moment(interview.at),
        invitation: interview.messages.length > 0 ? interview.messages[0].content : '',
        notes: interview.notes
      });
    }
    this.setState({
      view: view
    });
  }

  save = () => {
    const { form, saveInterview, application } = this.props;
    const interview = application.interview;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      saveInterview({
        data: {
          ...values,
          id: (interview || {}).id,
          application: application.id
        },
        success: () => {
          this.saveCompleted(application.id, values.invitation);
        },
        fail: () => {
          this.setState({ loading: null });
          // message.error('Saving is failed');
          notification.error({
            message: 'Notification',
            description: 'Saving is failed'
          });
          this.props.gotoOrigin();
        }
      });
    });
  };

  saveCompleted = (appId, message) => {
    this.setState({ loading: null });
    // message.success('Interview is saved successfully.');
    notification.success({
      message: 'Notification',
      description: 'Interview is saved successfully.'
    });
    this.props.updateMessageByInterview({
      id: new Date().getTime(),
      data: {
        application: appId,
        content: message
      }
    });
    this.props.gotoOrigin();
  };

  completeInvitation({ interview }) {
    confirm({
      content: 'Are you sure you want to complete this interview?',
      okText: `Complete`,
      okType: 'primary',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.changeInterview({
          data: {
            id: interview.id,
            changeType: 'complete'
          },
          success: () => {
            this.props.gotoOrigin();
            notification.success({
              message: 'Notification',
              description: 'Interview is completed successfully.'
            });
          },
          fail: () => {
            this.props.gotoOrigin();
            notification.error({
              message: 'Notification',
              description: 'Saving is failed'
            });
          }
        });
      }
    });
  }

  handleComplete() {
    this.setState({
      loading: {
        label: 'Completing...'
      }
    });
    const { interview } = this.state.completeApp;
    this.props.changeInterview({
      data: {
        id: interview.id,
        changeType: 'complete'
      },
      success: () => {
        if (this.state.ignoreFBCO) {
          this.setState({ loading: null });
          this.props.gotoOrigin();
          notification.success({
            message: 'Notification',
            description: 'Interview is completed successfully.'
          });
        } else {
          this.props.saveInterview({
            data: {
              at: moment(interview.at),
              invitation: interview.messages.length > 0 ? interview.messages[0].content : '',
              notes: interview.notes,
              id: interview.id,
              application: this.state.completeApp.id,
              feedback: this.state.feedbackComplete
            },
            success: () => {
              this.setState({ loading: null });
              this.props.gotoOrigin();
              notification.success({
                message: 'Notification',
                description: 'Interview is completed successfully.'
              });
            },
            fail: () => {
              this.setState({ loading: null });
              // message.error('Saving is failed');
              notification.error({
                message: 'Notification',
                description: 'Completing is failed'
              });
              this.props.gotoOrigin();
            }
          });
        }
      },
      fail: () => {
        this.setState({ loading: null });
        this.props.gotoOrigin();
        notification.error({
          message: 'Notification',
          description: 'Completing is failed'
        });
      }
    });
  }

  handleCancel() {
    this.setState({
      loading: {
        label: 'Cancelling...'
      }
    });
    const { interview } = this.state.cancelApp;
    this.props.removeInterview({
      id: interview.id,
      success: () => {
        if (this.state.ignoreFBCA) {
          this.setState({ loading: null });
          this.props.gotoOrigin();
          notification.success({
            message: 'Notification',
            description: 'Interview is cancelled successfully.'
          });
        } else {
          this.props.saveInterview({
            data: {
              at: moment(interview.at),
              invitation: interview.messages.length > 0 ? interview.messages[0].content : '',
              notes: interview.notes,
              id: interview.id,
              application: this.state.cancelApp.id,
              feedback: this.state.feedbackCancel
            },
            success: () => {
              this.setState({ loading: null });
              this.props.gotoOrigin();
              notification.success({
                message: 'Notification',
                description: 'Interview is cancelled successfully.'
              });
            },
            fail: () => {
              this.setState({ loading: null });
              // message.error('Saving is failed');
              notification.error({
                message: 'Notification',
                description: 'Cancelling is failed'
              });
              this.props.gotoOrigin();
            }
          });
        }
      },
      fail: () => {
        this.setState({ loading: null });
        this.props.gotoOrigin();
        notification.error({
          message: 'Notification',
          description: 'Cancelling is failed'
        });
      }
    });
    this.props.gotoOrigin();
  }

  onRemove = ({ interview }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to cancel this interview?',
      okText: `Yes`,
      okType: 'danger',
      cancelText: 'No',
      maskClosable: true,
      onOk: () => {
        this.props.removeInterview({
          id: interview.id,
          successMsg: {
            message: `Interview is cancelled.`
          },
          failMsg: {
            message: `Cancelling is failed.`
          }
        });
        this.props.gotoOrigin();
      }
    });
  };

  render() {
    const { loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { jobseeker, application, className, connected } = this.props;
    const interview = application.interview;
    const { view } = this.state;

    const image = helper.getPitch(jobseeker).thumbnail;
    const fullName = helper.getFullJSName(jobseeker);
    const age = jobseeker.age_public && jobseeker.age;
    const sex = jobseeker.sex_public && helper.getNameByID('sexes', jobseeker.sex);

    let email, mobile;
    if (connected) {
      email = jobseeker.email_public && jobseeker.email;
      mobile = jobseeker.mobile_public && jobseeker.mobile;
    }

    let status = '';
    if (interview) {
      if (interview.status === 'PENDING') {
        status = 'Interview request sent';
      } else if (interview.status === 'ACCEPTED') {
        status = 'Interview accepted';
      } else if (interview.status === 'COMPLETED') {
        status = 'This interview is done';
      } else if (interview.status === 'CANCELLED') {
        const userRole = helper.getNameByID('roles', interview.cancelled_by);
        status = `Interview cancelled by ${userRole === 'RECRUITER' ? 'Recruiter' : 'Job Seeker'}`;
      }
    }

    return (
      <Wrapper className={className}>
        <Row gutter={32}>
          <Col sm={24} md={10} lg={5}>
            <div className="avatar">
              <span style={{ backgroundImage: `url(${image})` }} />
            </div>
          </Col>
          <Col sm={24} md={14} lg={19}>
            <Row gutter={32}>
              <Col md={24} lg={14}>
                <div className="info">
                  <div className="name">{fullName}</div>
                  <ul>
                    {age && (
                      <li>
                        <label>Age:</label> {age}
                      </li>
                    )}
                    {sex && (
                      <li>
                        <label>Sex:</label> {sex}
                      </li>
                    )}
                    {email && (
                      <li>
                        <label>Email:</label> {email}
                      </li>
                    )}
                    {mobile && (
                      <li>
                        <label>Mobile:</label> {mobile}
                      </li>
                    )}
                  </ul>
                </div>
              </Col>
              <Col md={24} lg={10}>
                <div>
                  <h3>Overview</h3>
                  <p className="description">{jobseeker.description}</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider />

        <div className="interview-form-container">
          {view ? (
            <Wrapper className={className}>
              <Row gutter={32}>
                <Col sm={24} md={14} lg={19}>
                  <div>
                    <div>{`Date: ${moment(interview.at).format('dddd, MMMM Do, YYYY h:mm:ss A')}`}</div>
                    <div>{`Status: ${status}`}</div>
                    {interview.notes === '' ? (
                      <div>
                        Recruiter's notes:&nbsp;<span style={{ color: 'grey', fontStyle: 'italic' }}>None</span>
                      </div>
                    ) : (
                      <div>
                        <span>Recruiter's notes: {interview.notes}</span>
                      </div>
                    )}
                    {(interview.status === 'COMPLETED' || interview.status === 'CANCELLED') && (
                      <div>
                        {interview.feedback === '' ? (
                          <div>
                            Feedback:&nbsp;<span style={{ color: 'grey', fontStyle: 'italic' }}>None</span>
                          </div>
                        ) : (
                          <div>
                            <span>Feedback: {interview.feedback}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Col>
                <Col sm={24} md={10} lg={5}>
                  {interview.status !== 'COMPLETED' && interview.status !== 'CANCELLED' ? (
                    <div>
                      <Button
                        type="primary"
                        onClick={() => {
                          this.setState({ completeModalVisible: true, completeApp: application });
                          // this.completeInvitation(application);
                        }}
                      >
                        Complete Interview
                      </Button>
                      <Button
                        type="danger"
                        onClick={e => {
                          this.setState({ cancelModalVisible: true, cancelApp: application });
                          // this.onRemove(application, e);
                        }}
                      >
                        Cancel Invitation
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          this.setState({ view: false }, () => {
                            this.props.form.setFieldsValue({
                              at: moment(interview.at),
                              invitation: interview.messages.length > 0 ? interview.messages[0].content : '',
                              notes: interview.notes
                            });
                          });
                        }}
                      >
                        Edit Interview
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button
                        type="primary"
                        onClick={() => {
                          this.setState({ view: false, create: true });
                        }}
                      >
                        Arrange new interview
                      </Button>
                      <Button
                        onClick={e => {
                          this.setState({ view: false, editNoteOnly: true }, () => {
                            this.props.form.setFieldsValue({
                              at: moment(interview.at),
                              invitation: interview.messages.length > 0 ? interview.messages[0].content : '',
                              notes: interview.notes
                            });
                          });
                        }}
                      >
                        Edit notes
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>
            </Wrapper>
          ) : (
            <FormWrapper className="interview-form">
              <Item
                label={<span>Date&nbsp;</span>}
                style={{ display: this.state.editNoteOnly || this.props.onlyNote ? 'none' : 'block' }}
              >
                {getFieldDecorator('at', {
                  type: 'object',
                  rules: [{ required: true, message: 'Please pick date!' }]
                })(<DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm:ss" />)}
              </Item>
              <Item
                label={<span>Message&nbsp;</span>}
                style={{ display: this.state.editNoteOnly || this.props.onlyNote ? 'none' : 'block' }}
              >
                {getFieldDecorator('invitation', {
                  rules: [
                    { required: true, message: 'Please enter message!' },
                    { whitespace: true, message: 'This field may not be blank.' }
                  ]
                })(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
              </Item>
              <Item label={<span>Recruiter's notes&nbsp;</span>}>
                {getFieldDecorator('notes', {
                  rules: [
                    { required: true, message: 'Please enter note!' },
                    { whitespace: true, message: 'This field may not be blank.' }
                  ]
                })(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
              </Item>
              <div className="invite-btn">
                <Button type="primary" loading={loading} onClick={this.save}>
                  {this.props.create || this.state.create ? 'Send Invitation' : 'Update'}
                </Button>
                {!this.props.create &&
                  (this.props.view && !view) && (
                    <Button
                      type="default"
                      loading={loading}
                      onClick={() => {
                        this.setState({
                          view: true,
                          create: false,
                          editNoteOnly: false
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
              </div>
            </FormWrapper>
          )}
          <Modal
            title="Are you sure you want to complete this interview?"
            visible={this.state.completeModalVisible}
            onOk={() => this.handleComplete()}
            onCancel={() => this.setState({ completeModalVisible: false })}
          >
            <Item label={<span>Feedback</span>}>
              <TextArea
                autosize={{ minRows: 3, maxRows: 20 }}
                disabled={this.state.ignoreFBCO}
                value={this.state.feedbackComplete}
                onChange={e => this.setState({ feedbackComplete: e.target.value })}
              />
            </Item>
            <Checkbox
              value={this.state.ignoreFBCO}
              onChange={() => this.setState({ ignoreFBCO: !this.state.ignoreFBCO })}
            >
              Ignore Feedback
            </Checkbox>
          </Modal>
          <Modal
            title="Are you sure you want to cancel this interview?"
            visible={this.state.cancelModalVisible}
            onOk={() => this.handleCancel()}
            onCancel={() => this.setState({ cancelModalVisible: false })}
          >
            <Item label={<span>Feedback</span>}>
              <TextArea
                autosize={{ minRows: 3, maxRows: 20 }}
                disabled={this.state.ignoreFBCA}
                value={this.state.feedbackCancel}
                onChange={e => this.setState({ feedbackCancel: e.target.value })}
              />
            </Item>
            <Checkbox
              value={this.state.ignoreFBCA}
              onChange={() => this.setState({ ignoreFBCA: !this.state.ignoreFBCA })}
            >
              Ignore Feedback
            </Checkbox>
          </Modal>
        </div>
      </Wrapper>
    );
  }
}

export default connect(state => ({}), { saveInterview, updateMessageByInterview, changeInterview, removeInterview })(
  Form.create()(InterviewEdit)
);

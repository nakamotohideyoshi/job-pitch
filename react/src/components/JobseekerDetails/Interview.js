import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Form, Input, DatePicker, Alert, notification, Modal } from 'antd';
import moment from 'moment';

import { saveInterview, completeInterview, removeInterview } from 'redux/applications';

import { NoLabelField } from 'components';
import Wrapper from './Interview.styled';

const { Item } = Form;
const { TextArea } = Input;
const { confirm } = Modal;

class Interview extends React.Component {
  state = {
    visibleCompleteDialog: false
  };

  componentDidMount() {
    const { application, form } = this.props;
    const { interview } = application || {};
    if (interview) {
      form.setFieldsValue({
        at: moment(interview.at),
        invitation: (interview.messages[0] || {}).content,
        notes: interview.notes
      });
    }
  }

  onSave = () => {
    const { form, saveInterview, application } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      saveInterview({
        appId: application.id,
        data: {
          application: application.id,
          id: (application.interview || {}).id,
          ...values
        },
        onSuccess: () => {
          notification.success({
            message: 'Success',
            description: 'The interview is saved'
          });
        },
        onFail: () => {
          notification.error({
            message: 'Error',
            description: 'There was an error saving the interview'
          });
        }
      });
    });
  };

  onComplete = () => {
    const { completeInterview, application, form } = this.props;
    const { id, notes } = application.interview;
    const feedback = this.textbox.textAreaRef.value.trim();

    this.showCompleteDialog(false);

    completeInterview({
      appId: application.id,
      id,
      data: {
        notes,
        feedback
      },
      onSuccess: () => {
        notification.success({
          message: 'Success',
          description: 'The interview is completed'
        });
        form.setFieldsValue({
          at: null,
          invitation: '',
          notes: ''
        });
      },
      onFail: () => {
        notification.error({
          message: 'Error',
          description: 'There was an error completing the interview'
        });
      }
    });
  };

  onCancel = () => {
    const { application, form } = this.props;

    confirm({
      title: 'Are you sure you want to cancel this interview?',
      okText: `Ok`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeInterview({
          appId: application.id,
          id: application.interview.id,
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The interview is cancelled'
            });
            form.setFieldsValue({
              at: null,
              invitation: '',
              notes: ''
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error cancelling the interview'
            });
          }
        });
      }
    });
  };

  showCompleteDialog = visibleCompleteDialog => {
    if (this.textbox) this.textbox.textAreaRef.value = '';
    this.setState({ visibleCompleteDialog });
  };

  render() {
    const { application, form } = this.props;

    const { interview, loading } = application || {};
    const { status } = interview || {};

    const { getFieldDecorator } = form;

    return (
      <Wrapper>
        {status === 'PENDING' && <Alert message="Interview request sent" type="warning" />}
        {status === 'ACCEPTED' && <Alert message="Interview accepted" type="success" />}
        <Form>
          <Row gutter={30}>
            <Col md={16} lg={17}>
              <Item label="Date/time">
                {getFieldDecorator('at', {
                  rules: [{ required: true, message: 'Please select date/time!' }]
                })(
                  <DatePicker
                    allowClear={false}
                    showTime={{ format: 'H:mm' }}
                    format="ddd DD MMM, YYYY [at] H:mm A"
                    placeholder="Select"
                  />
                )}
              </Item>
              <Item label="Message">
                {getFieldDecorator('invitation', {
                  rules: [
                    { required: true, message: 'Please enter message!' },
                    { whitespace: true, message: 'This field may not be blank.' }
                  ]
                })(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
              </Item>
              <Item label="Recruiter's notes">
                {getFieldDecorator('notes')(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
              </Item>
            </Col>

            <Col md={8} lg={7}>
              <NoLabelField className="controls">
                <Button type="primary" disabled={loading} onClick={this.onSave}>
                  {interview ? 'Update Invitation' : 'Send Invitation'}
                </Button>
                {status === 'ACCEPTED' && (
                  <Button type="primary" disabled={loading} onClick={() => this.showCompleteDialog(true)}>
                    Complete Interview
                  </Button>
                )}
                {interview && (
                  <Button type="danger" disabled={loading} onClick={this.onCancel}>
                    Cancel Interview
                  </Button>
                )}
              </NoLabelField>
            </Col>
          </Row>
        </Form>

        <Modal
          title="Feedback"
          visible={this.state.visibleCompleteDialog}
          maskClosable={false}
          onOk={this.onComplete}
          onCancel={() => this.showCompleteDialog(false)}
        >
          <TextArea
            autosize={{ minRows: 3, maxRows: 20 }}
            ref={ref => {
              this.textbox = ref;
            }}
          />
        </Modal>
      </Wrapper>
    );
  }
}

export default connect(null, {
  saveInterview,
  completeInterview,
  removeInterview
})(Form.create()(Interview));

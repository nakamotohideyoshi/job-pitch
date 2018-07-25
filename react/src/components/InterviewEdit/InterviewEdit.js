// import React from 'react';
// import { Divider, Row, Col, Button, Input, Form } from 'antd';

// import * as helper from 'utils/helper';

// import { Icons, VideoPlayer } from 'components';
// import Wrapper from './InterviewEdit.styled';

// export default ({ jobseeker, connected, className, actions }) => {
//   const image = helper.getPitch(jobseeker).thumbnail;
//   const fullName = helper.getFullJSName(jobseeker);
//   const age = jobseeker.age_public && jobseeker.age;
//   const sex = jobseeker.sex_public && helper.getNameByID('sexes', jobseeker.sex);

//   let email, mobile;
//   if (connected) {
//     email = jobseeker.email_public && jobseeker.email;
//     mobile = jobseeker.mobile_public && jobseeker.mobile;
//   }

//   const pitches = jobseeker.pitches.filter(({ video }) => video);
//   console.log("ooo", jobseeker);
//   const { getFieldDecorator } = this.props.form;
//   const { TextArea } = Input;
//   return (
//     <Wrapper className={className}>
//       <Row gutter={32}>
//         <Col sm={24} md={10} lg={5}>
//           <div className="avatar">
//             <span style={{ backgroundImage: `url(${image})` }} />
//           </div>
//         </Col>
//         <Col sm={24} md={14} lg={19}>
//           <Row gutter={32}>
//             <Col md={24} lg={14}>
//               <div className="info">
//                 <div className="name">{fullName}</div>
//                 <ul>
//                   {age && (
//                     <li>
//                       <label>Age:</label> {age}
//                     </li>
//                   )}
//                   {sex && (
//                     <li>
//                       <label>Sex:</label> {sex}
//                     </li>
//                   )}
//                   {email && (
//                     <li>
//                       <label>Email:</label> {email}
//                     </li>
//                   )}
//                   {mobile && (
//                     <li>
//                       <label>Mobile:</label> {mobile}
//                     </li>
//                   )}
//                 </ul>
//               </div>
//             </Col>
//             <Col md={24} lg={10}>
//               <div>
//                 <h3>Overview</h3>
//                 <p className="description">{jobseeker.description}</p>
//               </div>
//             </Col>
//           </Row>
//         </Col>
//       </Row>

//       <Divider />

//       <div>
//       <TextArea
//             placeholder="Type a message here"
//             autosize={{ minRows: 1, maxRows: 15 }}
//             value={message}
//             onChange={this.onMessageInput}
//           />
//       </div>

//       <div style={{ clear: 'both' }} />
//     </Wrapper>
//   );
// };

import React from 'react';
import { connect } from 'react-redux';
import { saveInterview } from 'redux/interviews';
import { Form, Input, Button, DatePicker, Divider, Row, Col, notification } from 'antd';

import styled from 'styled-components';
import media from 'utils/mediaquery';

// import { NoLabelField } from 'components';

import Wrapper from './InterviewEdit.styled';

import * as helper from 'utils/helper';
import moment from 'moment';

import { updateMessageByInterview } from 'redux/applications';

const { Item } = Form;
const { TextArea } = Input;

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
    loading: null
  };

  componentDidMount() {
    const { application, form } = this.props;
    const interview = application.interview;
    if (interview) {
      form.setFieldsValue({
        at: moment(interview.at),
        invitation: interview.invitation,
        note: interview.note
      });
    }
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

  render() {
    const { loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { jobseeker, className, connected, view } = this.props;
    // const interview = application ? application.interview : null;

    const image = helper.getPitch(jobseeker).thumbnail;
    const fullName = helper.getFullJSName(jobseeker);
    const age = jobseeker.age_public && jobseeker.age;
    const sex = jobseeker.sex_public && helper.getNameByID('sexes', jobseeker.sex);

    let email, mobile;
    if (connected) {
      email = jobseeker.email_public && jobseeker.email;
      mobile = jobseeker.mobile_public && jobseeker.mobile;
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
          <FormWrapper className="interview-form">
            <Item label={<span>Date&nbsp;</span>}>
              {getFieldDecorator('at', {
                type: 'object',
                rules: [{ required: true, message: 'Please pick date!' }]
              })(
                view ? (
                  <DatePicker disabled style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm:ss" />
                ) : (
                  <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm:ss" />
                )
              )}
            </Item>
            <Item label={<span>Message&nbsp;</span>}>
              {getFieldDecorator('invitation', {
                rules: [
                  { required: true, message: 'Please enter message!' },
                  { whitespace: true, message: 'This field may not be blank.' }
                ]
              })(
                view ? (
                  <TextArea disabled autosize={{ minRows: 3, maxRows: 20 }} />
                ) : (
                  <TextArea autosize={{ minRows: 3, maxRows: 20 }} />
                )
              )}
            </Item>
            <Item label={<span>Note&nbsp;</span>}>
              {getFieldDecorator('note', {
                rules: [
                  { required: true, message: 'Please enter note!' },
                  { whitespace: true, message: 'This field may not be blank.' }
                ]
              })(
                view ? (
                  <TextArea disabled autosize={{ minRows: 3, maxRows: 20 }} />
                ) : (
                  <TextArea autosize={{ minRows: 3, maxRows: 20 }} />
                )
              )}
            </Item>
            {!view && (
              <div className="invite-btn">
                <Button type="primary" loading={loading} onClick={this.save}>
                  Send Invitation
                </Button>
              </div>
            )}
          </FormWrapper>
        </div>
      </Wrapper>
    );
  }
}

export default connect(state => ({}), { saveInterview, updateMessageByInterview })(Form.create()(InterviewEdit));

import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Checkbox, Modal, Switch, Select, InputNumber, Tooltip, Upload, message } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';
import faUpload from '@fortawesome/fontawesome-free-solid/faUpload';

import * as helper from 'utils/helper';
import DATA from 'utils/data';
import { saveJobseeker } from 'redux/auth';
import { uploadPitch } from 'redux/jobseeker/pitch';

import { VideoRecorder, VideoPlayer, PopupProgress, Intro, Icons } from 'components';
import FormWrapper from './Wrapper';

import imgLogo from 'assets/logo1.png';
import imgIntro1 from 'assets/intro1.png';
import imgIntro2 from 'assets/intro2.png';
import imgIntro3 from 'assets/intro3.png';

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const INTRO_DATA = [
  {
    title: 'Welcome!',
    image: imgLogo,
    comment: `You're just a few steps away from you next job!`
  },
  {
    title: 'Complete your profile',
    image: imgIntro1,
    comment: `It only takes a few seconds but will save you countless hours of searching!`
  },
  {
    title: 'Record Your Pitch',
    image: imgIntro2,
    comment: `Quick and easy! Use your phone camera to record a quick video introduction for yourself.`
  },
  {
    title: 'Get hired',
    image: imgIntro3,
    comment: `You will be able to apply and recruiters will be able to search and see your profile the moment its complete, what are you waiting for!`
  }
];

class ProfileForm extends React.Component {
  state = {
    loading: false,
    dontShowIntro: false,
    showRecorder: false,
    videoUrl: null,
    newPitchUrl: null,
    progress: null
  };

  componentDidMount() {
    const { jobseeker, form } = this.props;
    if (jobseeker) {
      form.setFieldsValue({
        active: jobseeker.active,
        first_name: jobseeker.first_name,
        last_name: jobseeker.last_name,
        email: jobseeker.email,
        email_public: jobseeker.email_public,
        telephone: jobseeker.telephone,
        telephone_public: jobseeker.telephone_public,
        mobile: jobseeker.mobile,
        mobile_public: jobseeker.mobile_public,
        age: jobseeker.age,
        age_public: jobseeker.age_public,
        sex: jobseeker.sex,
        sex_public: jobseeker.sex_public,
        nationality: jobseeker.nationality,
        nationality_public: jobseeker.nationality_public,
        national_insurance_number: jobseeker.national_insurance_number,
        description: jobseeker.description,
        has_references: jobseeker.has_references,
        truth_confirmation: jobseeker.truth_confirmation
      });
    }

    this.setState({ dontShowIntro: ProfileForm.dontShowIntro });
  }

  save = () => {
    const { form, saveJobseeker, jobseeker } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      if (!values.truth_confirmation) {
        message.error('You must check the box confirming the truth of the information you have provided.');
        return;
      }

      this.setState({ loading: true });
      saveJobseeker({
        formData: true,
        data: {
          ...values,
          id: (jobseeker || {}).id,
          cv: (values.cv || [])[0]
        },
        success: () => {
          this.setState({ loading: false });
          if (this.state.newPitchData) {
            this.uploadPitch();
          } else {
            message.success('Profile saved successfully!!');
            if (!jobseeker) {
              setTimeout(() => this.props.history.push('/jobseeker/settings/jobprofile'));
            }
          }
        },
        fail: ({ data }) => {
          this.setState({ loading: false });
          helper.setErrors(form, data, values);
        }
      });
    });
  };

  uploadPitch = () => {
    this.props.uploadPitch({
      data: this.state.newPitchData,
      onUploadProgress: (label, value) => {
        const progress = label ? { label, value } : null;
        this.setState({ progress });
      },
      success: () => {
        this.setState({ progress: null });
        message.success('Profile saved successfully!');

        if (!this.props.jobseeker.profile) {
          this.props.history.push('/jobseeker/settings/jobprofile');
        }
      },
      fail: error => {
        this.setState({ progress: null });
        message.error(error);
      }
    });
  };

  viewCV = () => window.open(this.props.jobseeker.cv);

  recordPitch = () => {
    if (navigator.userAgent.indexOf('iPhone') !== -1) {
      confirm({
        title: 'To record your video, you need to download the app',
        okText: 'Sign out',
        maskClosable: true,
        onOk: () => {
          window.open('https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&mt=8', '_blank');
        }
      });
    } else {
      this.setState({ showRecorder: true });
    }
  };

  cancelNewPitch = () =>
    this.setState({
      newPitchUrl: null,
      newPitchData: null
    });

  playVideo = videoUrl => this.setState({ videoUrl });

  hideDialog = (url, data) => {
    this.setState({
      newPitchUrl: url || this.state.newPitchUrl,
      newPitchData: data || this.state.newPitchData,
      showRecorder: false,
      videoUrl: null
    });
  };

  closeIntro = () => {
    ProfileForm.dontShowIntro = true;
    this.setState({ dontShowIntro: true });
  };

  render() {
    const { dontShowIntro, loading, showRecorder, videoUrl, newPitchUrl, progress } = this.state;
    const { getFieldDecorator } = this.props.form;
    const jobseeker = this.props.jobseeker || {};
    const pitch = helper.getPitch(jobseeker) || {};

    return (
      <FormWrapper>
        <Item label="Active">
          {getFieldDecorator('active', { valuePropName: 'checked', initialValue: true })(<Switch />)}
        </Item>

        <Item label="First name">
          {getFieldDecorator('first_name', {
            rules: [
              { required: true, message: 'Please input your first name!' },
              { whitespace: true, message: 'This field may not be blank.' }
            ]
          })(<Input />)}
        </Item>

        <Item label="Last name">
          {getFieldDecorator('last_name', {
            rules: [
              { required: true, message: 'Please input your last name!' },
              { whitespace: true, message: 'This field may not be blank.' }
            ]
          })(<Input />)}
        </Item>

        <Item label="Email" className="with-public">
          {getFieldDecorator('email', {
            initialValue: DATA.email,
            rules: [{ type: 'email', message: 'The input is not valid email!' }]
          })(<Input disabled />)}
        </Item>
        <div className="public-check">
          {getFieldDecorator('email_public', { valuePropName: 'checked', initialValue: true })(
            <Checkbox>Public</Checkbox>
          )}
        </div>

        <Item label="Telephone" className="with-public">
          {getFieldDecorator('telephone')(<Input />)}
        </Item>
        <div className="public-check">
          {getFieldDecorator('telephone_public', { valuePropName: 'checked', initialValue: true })(
            <Checkbox>Public</Checkbox>
          )}
        </div>

        <Item label="Phone number" className="with-public">
          {getFieldDecorator('mobile')(<Input />)}
        </Item>
        <div className="public-check">
          {getFieldDecorator('mobile_public', { valuePropName: 'checked', initialValue: true })(
            <Checkbox>Public</Checkbox>
          )}
        </div>

        <Item label="Age" className="with-public">
          {getFieldDecorator('age')(<InputNumber min={1} />)}
        </Item>
        <div className="public-check">
          {getFieldDecorator('age_public', { valuePropName: 'checked', initialValue: true })(
            <Checkbox>Public</Checkbox>
          )}
        </div>

        <Item label="Gender" className="with-public">
          {getFieldDecorator('sex')(
            <Select allowClear>
              {DATA.sexes.map(({ id, name }) => (
                <Option value={id} key={id}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Item>
        <div className="public-check">
          {getFieldDecorator('sex_public', { valuePropName: 'checked', initialValue: true })(
            <Checkbox>Public</Checkbox>
          )}
        </div>

        <Item label="Nationality" className="with-public">
          {getFieldDecorator('nationality')(
            <Select
              showSearch
              allowClear
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {DATA.nationalities.map(({ id, name }) => (
                <Option value={id} key={id}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Item>
        <div className="public-check">
          {getFieldDecorator('nationality_public', { valuePropName: 'checked', initialValue: true })(
            <Checkbox>Public</Checkbox>
          )}
        </div>

        <Item
          label={
            <span>
              National insurance number&nbsp;
              <Tooltip title="Supplying your national insurance number makes it easier for employers to recruit you.
                          Your National Insurance number will not be shared with employers.">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </Tooltip>
            </span>
          }
        >
          {getFieldDecorator('national_insurance_number')(<Input />)}
        </Item>

        <Item
          label={
            <span>
              CV summary&nbsp;
              <Tooltip title="CV summary is what the recruiter first see,
                      write if you have previous relevant experience where and for how long.">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </Tooltip>
            </span>
          }
        >
          {getFieldDecorator('description', {
            rules: [
              { required: true, message: 'Please enter description!' },
              { whitespace: true, message: 'This field may not be blank.' }
            ]
          })(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
        </Item>

        <div className="ant-form-item">
          <div className="ant-form-item-label" />
          <div className="ant-form-item-control-wrapper">
            {jobseeker.cv && (
              <Button style={{ marginBottom: '12px' }} onClick={this.viewCV}>
                View CV
              </Button>
            )}

            {getFieldDecorator('cv', {
              valuePropName: 'fileList',
              getValueFromEvent: e => e && e.fileList
            })(
              <Upload.Dragger beforeUpload={() => false}>
                <p className="ant-upload-text">
                  <FontAwesomeIcon icon={faUpload} /> Click or drag file to this area to upload CV
                </p>
                <p className="ant-upload-hint">
                  Upload your CV using your favourite cloud service, or take a photo if you have it printed out.
                </p>
              </Upload.Dragger>
            )}
          </div>
        </div>

        <Item
          label={
            <span>
              Video pitch&nbsp;
              <Tooltip title="Tips on how to record your pitch will be placed here.">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </Tooltip>
            </span>
          }
        >
          <Button style={{ marginRight: '12px' }} onClick={this.recordPitch}>
            <Icons.Video /> Record New
          </Button>
          {pitch.video && (
            <Button onClick={() => this.playVideo(pitch.video)}>
              <Icons.Play />Play Current
            </Button>
          )}

          {newPitchUrl && (
            <div className="record-info">
              <a onClick={() => this.playVideo(newPitchUrl)}>New video</a>
              {' save to upload and click '}
              <a onClick={this.cancelNewPitch}>here</a>
              {' to cancel'}
            </div>
          )}
        </Item>

        <div className="ant-form-item">
          <div className="ant-form-item-label" />
          <div className="ant-form-item-control-wrapper">
            {getFieldDecorator('has_references', { valuePropName: 'checked' })(<Checkbox>Remember me</Checkbox>)}

            {getFieldDecorator('truth_confirmation', { valuePropName: 'checked' })(
              <Checkbox>
                By ticking this box I confirm that all information given is true, I understand that any falsification
                may lead to dismissal, and that I am entitled to work in UK & Northern Ireland. If required I will give
                full details if I have been convicted of any criminal offence.
              </Checkbox>
            )}
          </div>
        </div>

        <div className="ant-form-item">
          <div className="ant-form-item-label" />
          <div className="ant-form-item-control-wrapper">
            <Button type="primary" loading={loading} onClick={this.save}>
              Save
            </Button>
          </div>
        </div>

        {!jobseeker.id && !dontShowIntro && <Intro data={INTRO_DATA} onClose={this.closeIntro} />}
        {showRecorder && <VideoRecorder onClose={this.hideDialog} />}
        {videoUrl && <VideoPlayer videoUrl={videoUrl} onClose={this.hideDialog} />}
        {progress && <PopupProgress label={progress.label} value={progress.value} />}
      </FormWrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker
  }),
  { saveJobseeker, uploadPitch }
)(Form.create()(ProfileForm));

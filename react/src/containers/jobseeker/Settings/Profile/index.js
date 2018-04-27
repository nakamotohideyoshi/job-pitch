import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Checkbox, Switch, Select, InputNumber, Popover, Upload, message } from 'antd';

import { saveJobseeker, uploadPitch } from 'redux/jobseeker/profile';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { NoLabelField, VideoRecorder, VideoPlayer, PopupProgress, Intro, Icons, JobseekerDetails } from 'components';
import imgLogo from 'assets/logo1.png';
import imgIntro1 from 'assets/intro1.png';
import imgIntro2 from 'assets/intro2.png';
import imgIntro3 from 'assets/intro3.png';
import FormWrapper from './styled';

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

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

class Profile extends React.Component {
  state = {
    loading: false,
    dontShowIntro: false,
    showPlayer: false,
    visiblePreview: false,
    newPitchUrl: null,
    newPitchData: null,
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

    this.setState({ dontShowIntro: DATA[`dontShowIntro_${DATA.email}`] });
  }

  showPreview = visible => {
    this.setState({ visiblePreview: visible });
  };

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
        fail: data => {
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

  playPitch = showPlayer => this.setState({ showPlayer });

  changePitch = (newPitchUrl, newPitchData) => {
    this.setState({ newPitchUrl, newPitchData });
  };

  closeIntro = () => {
    DATA[`dontShowIntro_${DATA.email}`] = true;
    this.setState({ dontShowIntro: true });
  };

  recordButton = props => <Button {...props}>Record New</Button>;

  render() {
    const { dontShowIntro, loading, showPlayer, progress, visiblePreview } = this.state;
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
              <Popover
                placement="right"
                content={
                  <span>
                    Supplying your national insurance number makes<br />
                    it easier for employers to recruit you. Your National<br />
                    Insurance number will not be shared with employers.
                  </span>
                }
              >
                <Icons.QuestionCircle />
              </Popover>
            </span>
          }
        >
          {getFieldDecorator('national_insurance_number')(<Input />)}
        </Item>

        <Item
          label={
            <span>
              CV summary&nbsp;
              <Popover
                placement="right"
                content={
                  <span>
                    CV summary is what the recruiter first see, write if you<br />
                    have previous relevant experience where and for how long.<br />
                    Don't type in phone numbers/email address here.
                  </span>
                }
              >
                <Icons.QuestionCircle />
              </Popover>
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

        <NoLabelField>
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
                <Icons.Upload /> Click or drag file to this area to upload CV
              </p>
              <p className="ant-upload-hint">
                Upload your CV using your favourite cloud service, or take a photo if you have it printed out.
              </p>
            </Upload.Dragger>
          )}
        </NoLabelField>

        <Item
          label={
            <span>
              Video pitch&nbsp;
              <Popover
                placement="right"
                content={
                  <span>
                    Record your up to 30 sec selfie video. The key is to<br />
                    just be yourself! You can record on your phone pretty<br />
                    much anywhere, at home on the bus or in a coffee shop<br />
                    it doesn’t matter, and you can re-record as many times<br />
                    times as you want. Check out our{' '}
                    <a href="https://vimeo.com/255467562" target="_blank" rel="noopener noreferrer">
                      example video
                    </a>
                  </span>
                }
              >
                <Icons.QuestionCircle />
              </Popover>
            </span>
          }
        >
          <div>
            <VideoRecorder showInfo buttonComponent={this.recordButton} onChange={this.changePitch} />
            {pitch.video && (
              <Button onClick={() => this.playPitch(true)} className="btn-play">
                Play Current
              </Button>
            )}
          </div>
        </Item>

        <NoLabelField>
          {getFieldDecorator('has_references', { valuePropName: 'checked' })(<Checkbox>References Available</Checkbox>)}

          {getFieldDecorator('truth_confirmation', { valuePropName: 'checked' })(
            <Checkbox>
              By ticking this box I confirm that all information given is true, I understand that any falsification may
              lead to dismissal, and that I am entitled to work in UK & Northern Ireland. If required I will give full
              details if I have been convicted of any criminal offence.
            </Checkbox>
          )}
        </NoLabelField>

        <NoLabelField>
          <Button type="primary" className="btn-save" loading={loading} onClick={this.save}>
            Save
          </Button>
          <Button className="btn-preview" onClick={() => this.showPreview(true)}>
            Preview
          </Button>
        </NoLabelField>

        {!jobseeker.id && !dontShowIntro && <Intro data={INTRO_DATA} onClose={this.closeIntro} />}
        {showPlayer && <VideoPlayer videoUrl={pitch.video} onClose={() => this.playPitch()} />}
        {progress && <PopupProgress label={progress.label} value={progress.value} />}
        {visiblePreview && (
          <JobseekerDetails title="My Profile" jobseeker={jobseeker} onClose={() => this.showPreview(false)} />
        )}
      </FormWrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker
  }),
  { saveJobseeker, uploadPitch }
)(Form.create()(Profile));

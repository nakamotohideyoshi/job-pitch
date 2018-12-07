import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Switch, Select, InputNumber, Popover, Upload, message, Drawer } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { saveJobseekerAction, uploadPitchAction } from 'redux/jobseeker/profile';
import {
  NoLabelField,
  PitchSelector,
  PopupProgress,
  Intro,
  Icons,
  ImageSelector,
  JobseekerDetails,
  LinkButton
} from 'components';
import DefaultAvatar from 'assets/avatar.png';
import FormWrapper from './styled';

/* eslint-disable react/prop-types */
const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

class Profile extends React.Component {
  state = {
    visibleIntro: false,
    visiblePreview: false,
    cvData: null,
    isRemovedCV: false,
    pitchData: null,
    avatar: {
      url: DefaultAvatar,
      file: null,
      exist: false
    },
    loading: null
  };

  componentDidMount() {
    const { jobseeker, form } = this.props;

    this.setState({ visibleIntro: !jobseeker && DATA.tutorial === 1 });

    if (jobseeker) {
      this.setState({
        avatar: {
          url: jobseeker.profile_thumb || DefaultAvatar,
          exist: jobseeker.profile_thumb
        }
      });

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
  }

  showIntro = () => {
    const INTRO_DATA = [
      {
        title: 'Welcome!',
        image: require('assets/intro0.png'),
        comment: `You're just a few steps away from your next job!`
      },
      {
        title: 'Complete your profile',
        image: require('assets/intro1.png'),
        comment: `It only takes a few seconds but will save you countless hours of searching!`
      },
      {
        title: 'Record Your Pitch',
        image: require('assets/intro2.png'),
        comment: `Quick and easy! Use your phone camera to record a quick video introduction for yourself.`
      },
      {
        title: 'Get hired',
        image: require('assets/intro3.png'),
        comment: `You will be able to apply and recruiters will be able to search and see your profile the moment it's complete, what are you waiting for!`
      }
    ];
    return <Intro data={INTRO_DATA} onClose={this.closeIntro} />;
  };

  closeIntro = () => {
    DATA.tutorial = 2;
    this.setState({ visibleIntro: false });
  };

  showPreview = visiblePreview => {
    this.setState({ visiblePreview });
  };

  setAvatar = (file, url) => {
    this.setState({
      avatar: {
        url: url || DefaultAvatar,
        file,
        exist: !!file
      }
    });
  };

  changedCV = info => {
    this.setState({ cvData: info.fileList.length ? info.file : null });
  };

  viewCV = () => {
    window.open(this.props.jobseeker.cv);
  };

  removeCV = () => {
    this.setState({ isRemovedCV: true });
  };

  changePitch = pitchData => {
    this.setState({ pitchData });
  };

  save = () => {
    const { form, saveJobseekerAction, jobseeker } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      if (helper.checkIfEmailInString(values.description)) {
        form.setFields({
          description: {
            value: values.description,
            errors: [new Error(`Don't type in email address here.`)]
          }
        });
        return;
      }

      if (helper.checkIfPhoneNumberInString(values.description)) {
        form.setFields({
          description: {
            value: values.description,
            errors: [new Error(`Don't type in phone number here.`)]
          }
        });
        return;
      }

      if (!values.truth_confirmation) {
        message.error('You must check the box confirming the truth of the information you have provided.');
        return;
      }

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      const { avatar, cvData, isRemovedCV } = this.state;
      const data = {
        ...values
      };
      if (avatar.file || ((jobseeker || {}).profile_image && !avatar.exist)) {
        data.profile_image = avatar.file;
      }
      if (cvData || isRemovedCV) {
        data.cv = cvData;
      }

      saveJobseekerAction({
        isFormData: true,
        id: (jobseeker || {}).id,
        data,

        success: () => {
          if (this.state.pitchData) {
            this.uploadPitch();
          } else {
            this.saveCompleted();
          }
        },

        fail: data => {
          this.setState({ loading: null });
          helper.setErrors(form, data, values);
        },

        onUploadProgress:
          data.profile_image || cvData
            ? progress => {
                this.setState({
                  loading: {
                    label: 'Uploading...',
                    progress: Math.floor((progress.loaded / progress.total) * 100)
                  }
                });
              }
            : null
      });
    });
  };

  uploadPitch = () => {
    this.props.uploadPitchAction({
      data: this.state.pitchData,

      onSuccess: () => {
        this.saveCompleted();
      },

      onFail: () => {
        this.setState({ loading: null });
        message.error('Uploading is failed.');
      },

      onProgress: (label, progress) => {
        this.setState({
          loading: { label, progress }
        });
      }
    });
  };

  saveCompleted = () => {
    const { active, profile } = this.props.jobseeker;

    this.setState({
      loading: null,
      avatar: {
        ...this.state.avatar,
        file: null
      },
      cvData: null
    });

    message.success('Profile is saved successfully.');

    if (!active) {
      message.info('Your profile will not be visible and will not be able to apply for job or send message');
    }

    if (!profile) {
      this.props.history.push('/jobseeker/settings/jobprofile');
      return;
    }

    const { from } = this.props.location.state || {};
    if (from) {
      this.props.history.push(from.pathname, from.state);
    }
  };

  render() {
    const { visibleIntro, loading, visiblePreview, avatar, cvData, isRemovedCV } = this.state;
    const { getFieldDecorator } = this.props.form;
    const jobseeker = this.props.jobseeker || {};
    const pitch = helper.getPitch(jobseeker);

    return (
      <FormWrapper>
        <Item label="Active">
          {getFieldDecorator('active', { valuePropName: 'checked', initialValue: true })(<Switch />)}
        </Item>

        <Item label="Photo">
          <ImageSelector url={avatar.url} removable={avatar.exist} onChange={this.setAvatar} />
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
                    Supplying your national insurance number makes
                    <br />
                    it easier for employers to recruit you. Your National
                    <br />
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
                    CV summary is what the recruiter first see, write if you
                    <br />
                    have previous relevant experience where and for how long.
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
          {jobseeker.cv && !isRemovedCV && (
            <div style={{ marginBottom: '12px' }}>
              <Button onClick={this.viewCV}>View CV</Button>
              <Button onClick={this.removeCV}>Remove CV</Button>
            </div>
          )}

          <Upload.Dragger beforeUpload={() => false} fileList={cvData ? [cvData] : []} onChange={this.changedCV}>
            <p className="ant-upload-text">
              <Icons.CloudUpload /> Click or drag file to this area to upload CV
            </p>
            <p className="ant-upload-hint">
              Upload your CV using your favourite cloud service, or take a photo if you have it printed out.
            </p>
          </Upload.Dragger>
        </NoLabelField>

        <Item
          label={
            <span>
              Video pitch&nbsp;
              <Popover
                placement="right"
                content={
                  <span>
                    Record your up to 30 sec selfie video. The key is to
                    <br />
                    just be yourself! You can record on your phone pretty
                    <br />
                    much anywhere, at home on the bus or in a coffee shop
                    <br />
                    it doesn’t matter, and you can re-record as many times
                    <br />
                    times as you want. Check out our{' '}
                    <LinkButton href="https://vimeo.com/255467562" target="_blank" rel="noopener noreferrer">
                      example video
                    </LinkButton>
                  </span>
                }
              >
                <Icons.QuestionCircle />
              </Popover>
            </span>
          }
        >
          <PitchSelector currentPitch={pitch} onChange={this.changePitch} />
        </Item>

        <NoLabelField>
          {getFieldDecorator('has_references', { valuePropName: 'checked' })(<Checkbox>References Available</Checkbox>)}

          {getFieldDecorator('truth_confirmation', { valuePropName: 'checked' })(
            <Checkbox>
              By ticking this box I confirm that all information given is true, I understand that any falsification may
              lead to dismissal, and that I am entitled to work. If required by employer I will give full details if I
              have been convicted of any criminal offence.
            </Checkbox>
          )}
        </NoLabelField>

        <NoLabelField>
          <Button type="primary" className="btn-save" loading={loading} onClick={this.save}>
            Save
          </Button>
          {pitch && (
            <Button className="btn-preview" onClick={() => this.showPreview(true)}>
              Preview
            </Button>
          )}
        </NoLabelField>

        <Drawer placement="right" onClose={() => this.showPreview()} visible={visiblePreview}>
          {jobseeker && <JobseekerDetails jobseekerData={jobseeker} />}
        </Drawer>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}

        {visibleIntro && this.showIntro()}
      </FormWrapper>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      jobseeker: state.auth.jobseeker
    }),
    { saveJobseekerAction, uploadPitchAction }
  )(Form.create()(Profile))
);

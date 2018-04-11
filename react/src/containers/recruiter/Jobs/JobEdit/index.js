import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Select, Switch, Tooltip, Button, message } from 'antd';

import { getWorkplace } from 'redux/recruiter/workplaces';
import { getJob, saveJob } from 'redux/recruiter/jobs';
import { uploadJobPitch } from 'redux/jobseeker/pitch';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import {
  PageSubHeader,
  PopupProgress,
  ImageSelector,
  NoLabelField,
  VideoRecorder,
  VideoPlayer,
  Icons
} from 'components';
import Wrapper from './styled';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

class JobEdit extends React.Component {
  state = {
    showPlayer: false,
    newPitchUrl: null,
    newPitchData: null,
    logo: {
      url: null,
      file: null,
      exist: false
    }
  };

  componentDidMount() {
    const { match, getWorkplace, getJob, form } = this.props;
    const workplaceId = parseInt(match.params.workplaceId, 10);
    if (workplaceId) {
      getWorkplace({
        id: workplaceId,
        success: workplace =>
          this.setState({
            logo: {
              url: helper.getWorkplaceLogo(workplace),
              exist: false
            }
          }),
        fail: this.goBuisinessList
      });
      return;
    }

    const jobId = parseInt(match.params.jobId, 10);

    getJob({
      id: jobId,
      success: job => {
        this.setState({
          job,
          logo: {
            url: helper.getJobLogo(job),
            exist: (job.images || []).length > 0
          }
        });

        form.setFieldsValue({
          status: job.status === DATA.JOB.OPEN,
          title: job.title,
          sector: job.sector,
          contract: job.contract,
          hours: job.hours,
          description: job.description
        });
      },
      fail: this.goBuisinessList
    });
  }

  setLogo = (file, url) =>
    this.setState({
      logo: {
        url: url || helper.getWorkplaceLogo(this.props.workplace),
        file,
        exist: !!file
      }
    });

  goBuisinessList = () => this.props.history.push('/recruiter/jobs/business');

  goJobList = () => {
    const { workplace, history } = this.props;
    const { job } = this.state;
    history.push(`/recruiter/jobs/job/${workplace.id || job.location}`);
  };

  save = () => {
    const { form, workplace, saveJob } = this.props;
    const { job } = this.state;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      const { logo } = this.state;
      saveJob({
        data: {
          ...values,
          status: values.status ? DATA.JOB.OPEN : DATA.jobClosed,
          location: (workplace || {}).id || (job || {}).location,
          id: (job || {}).id
        },
        logo,
        onUploading: progress => {
          const value = progress ? Math.floor(progress.loaded / progress.total * 100) : null;
          this.setState({
            uploading: {
              label: 'Logo uploading...',
              value
            }
          });
        },
        onSuccess: () => {
          if (this.state.newPitchData) {
            this.uploadPitch();
          } else {
            message.success('Job saved successfully!');
          }
        },
        onFail: error => {
          message.error(error);
        }
      });
    });
  };

  uploadPitch = () => {
    const { job, newPitchData } = this.state;
    this.props.uploadJobPitch({
      job: job.id,
      data: newPitchData,
      onUploadProgress: (label, value) => {
        const uploading = label ? { label, value } : null;
        this.setState({ uploading });
      },
      success: () => {
        this.setState({ uploading: null });
        message.success('Profile saved successfully!');

        if (!this.props.jobseeker.profile) {
          this.props.history.push('/jobseeker/settings/jobprofile');
        }
      },
      fail: error => {
        this.setState({ uploading: null });
        message.error(error);
      }
    });
  };

  playPitch = showPlayer => this.setState({ showPlayer });

  changePitch = (newPitchUrl, newPitchData) => {
    this.setState({ newPitchUrl, newPitchData });
  };

  recordButton = props => (
    <Button {...props}>
      <Icons.Video /> Record New
    </Button>
  );

  render() {
    const { workplace, saving, form } = this.props;
    const { job } = this.state;
    const workplace1 = workplace || (job || {}).location_data || {};
    const business = workplace1.business_data || {};
    const { getFieldDecorator } = form;
    const { logo, uploading, showPlayer } = this.state;

    const pitch = {};

    return (
      <Wrapper>
        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/recruiter/jobs/workplace/${business.id}`}>Workplaces</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/recruiter/jobs/job/${workplace1.id}`}>Jobs</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {workplace && 'Add'}
              {job && 'Edit'}
            </Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        <Form>
          <Item label="Active" className="status-field">
            {getFieldDecorator('status', { valuePropName: 'checked', initialValue: true })(<Switch />)}
          </Item>

          <Item label="Title">
            {getFieldDecorator('title', {
              rules: [
                { required: true, message: 'Please input job title!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<Input />)}
          </Item>

          <Item label="Sector">
            {getFieldDecorator('sector', {
              rules: [{ required: true, message: 'Please select sector!' }]
            })(
              <Select
                showSearch
                allowClear
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {DATA.sectors.map(({ id, name }) => (
                  <Option value={id} key={id}>
                    {name}
                  </Option>
                ))}
              </Select>
            )}
          </Item>

          <Item label="Contract">
            {getFieldDecorator('contract', {
              rules: [{ required: true, message: 'Please select contract!' }]
            })(
              <Select allowClear>
                {DATA.contracts.map(({ id, name }) => (
                  <Option value={id} key={id}>
                    {name}
                  </Option>
                ))}
              </Select>
            )}
          </Item>

          <Item label="Hours">
            {getFieldDecorator('hours', {
              rules: [{ required: true, message: 'Please select hours!' }]
            })(
              <Select allowClear>
                {DATA.hours.map(({ id, name }) => (
                  <Option value={id} key={id}>
                    {name}
                  </Option>
                ))}
              </Select>
            )}
          </Item>

          <Item label="Description">
            {getFieldDecorator('description', {
              rules: [
                { required: true, message: 'Please enter description!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
          </Item>

          <Item
            label={
              <span>
                Video pitch&nbsp;
                <Tooltip title="Tips on how to record your pitch will be placed here.">
                  <Icons.QuestionCircle />
                </Tooltip>
              </span>
            }
          >
            <div>
              <VideoRecorder showInfo buttonComponent={this.recordButton} onChange={this.changePitch} />
              {!pitch.video && (
                <Button onClick={() => this.playPitch(true)} className="btn-play">
                  <Icons.Play />Play Current
                </Button>
              )}
            </div>
          </Item>

          <Item label="Logo">
            <ImageSelector url={logo.url} removable={logo.exist} onChange={this.setLogo} />
          </Item>

          <NoLabelField className="subimt-field">
            <Button type="primary" loading={saving} onClick={this.save}>
              Save
            </Button>
            <Button onClick={this.goJobList}>Cancel</Button>
          </NoLabelField>
        </Form>

        {showPlayer && <VideoPlayer videoUrl={pitch.video} onClose={() => this.playPitch()} />}
        {uploading && <PopupProgress label={uploading.label} value={uploading.value} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    workplace: state.rc_workplaces.workplace,
    saving: state.rc_jobs.saving
  }),
  {
    getWorkplace,
    getJob,
    saveJob,
    uploadJobPitch
  }
)(Form.create()(JobEdit));

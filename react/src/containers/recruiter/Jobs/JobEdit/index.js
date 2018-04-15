import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Select, Switch, Tooltip, Button, notification } from 'antd';

import { saveJob } from 'redux/recruiter/jobs';
import { uploadJobPitch } from 'redux/pitch';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PopupProgress, ImageSelector, NoLabelField, VideoRecorder, VideoPlayer, Icons } from 'components';
import StyledForm from './styled';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

class JobEdit extends React.Component {
  state = {
    logo: {
      url: null,
      file: null,
      exist: false
    },
    loading: null,
    showPlayer: false,
    newPitchUrl: null,
    newPitchData: null
  };

  componentDidMount() {
    const { workplace, job, form } = this.props;

    if (!workplace) {
      this.goBuisinessList();
      return;
    }

    if (job) {
      this.setState({
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
    } else {
      this.setState({
        logo: {
          url: helper.getWorkplaceLogo(workplace),
          exist: false
        }
      });
    }
  }

  setLogo = (file, url) =>
    this.setState({
      logo: {
        url: url || helper.getWorkplaceLogo(this.props.workplace),
        file,
        exist: !!file
      }
    });

  goBuisinessList = () => {
    this.props.history.push('/recruiter/jobs/business');
  };

  goJobList = () => {
    const { workplace: { id }, history } = this.props;
    history.push(`/recruiter/jobs/job/${id}`);
  };

  save = () => {
    const { form, workplace, job, saveJob } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      saveJob({
        data: {
          ...values,
          status: values.status ? DATA.JOB.OPEN : DATA.JOB.CLOSED,
          location: workplace.id,
          id: (job || {}).id
        },
        logo: this.state.logo,
        onSuccess: msg => {
          if (this.state.newPitchData) {
            this.uploadPitch();
          } else {
            notification.success({
              message: 'Notification',
              description: msg
            });
            this.goJobList();
          }
        },
        onFail: error => {
          this.setState({ loading: null });
          notification.error({
            message: 'Notification',
            description: error
          });
        },
        onProgress: progress => {
          this.setState({
            loading: {
              label: 'Logo uploading...',
              progress: Math.floor(progress.loaded / progress.total * 100)
            }
          });
        }
      });
    });
  };

  uploadPitch = () => {
    this.props.uploadJobPitch({
      job: this.props.job.id,
      data: this.state.newPitchData,
      onSuccess: msg => {
        notification.success({
          message: 'Notification',
          description: msg
        });
        this.goJobList();
      },
      onFail: error => {
        this.setState({ loading: null });
        notification.error({
          message: 'Notification',
          description: error
        });
      },
      onProgress: (label, progress) => {
        this.setState({
          loading: { label, progress }
        });
      }
    });
  };

  playPitch = showPlayer => this.setState({ showPlayer });

  changePitch = (newPitchUrl, newPitchData) => {
    this.setState({ newPitchUrl, newPitchData });
  };

  recordButton = props => <Button {...props}>Record New</Button>;

  render() {
    const { logo, loading, showPlayer } = this.state;
    const { workplace, job, form } = this.props;
    const { getFieldDecorator } = form;
    const pitch = helper.getPitch(job) || {};

    return (
      <Fragment>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs/business">Businesses</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {workplace && <Link to={`/recruiter/jobs/workplace/${workplace.business_data.id}`}>Workplaces</Link>}
          </Breadcrumb.Item>
          <Breadcrumb.Item>{workplace && <Link to={`/recruiter/jobs/job/${workplace.id}`}>Jobs</Link>}</Breadcrumb.Item>
          <Breadcrumb.Item>{job ? 'Edit' : 'Add'}</Breadcrumb.Item>
        </Breadcrumb>

        <div className="content">
          <StyledForm>
            <Item label="Active" className="status-field">
              {getFieldDecorator('status', { valuePropName: 'checked', initialValue: true })(<Switch />)}
            </Item>

            <Item label="Title">
              {getFieldDecorator('title', {
                rules: [
                  { required: true, message: 'Please input job title!' },
                  { whitespace: true, message: 'This field may not be blank.' }
                ]
              })(<Input autoFocus />)}
            </Item>

            <Item label="Sector">
              {getFieldDecorator('sector', {
                rules: [{ required: true, message: 'Please select sector!' }]
              })(
                <Select
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
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
                {pitch.video && (
                  <Button onClick={() => this.playPitch(true)} className="btn-play">
                    Play Current
                  </Button>
                )}
              </div>
            </Item>

            <Item label="Logo">
              <ImageSelector url={logo.url} removable={logo.exist} onChange={this.setLogo} />
            </Item>

            <NoLabelField className="subimt-field">
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              <Button onClick={this.goJobList}>Cancel</Button>
            </NoLabelField>
          </StyledForm>
        </div>

        {showPlayer && <VideoPlayer videoUrl={pitch.video} onClose={() => this.playPitch()} />}
        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Fragment>
    );
  }
}

export default connect(
  (state, { match }) => {
    const workplaceId = parseInt(match.params.workplaceId, 10);
    const workplace = helper.getItemByID(state.rc_workplaces.workplaces, workplaceId);
    const jobId = parseInt(match.params.jobId, 10);
    const job = helper.getItemByID(state.rc_jobs.jobs, jobId);
    return {
      workplace: workplace || (job || {}).location_data,
      job
    };
  },
  {
    saveJob,
    uploadJobPitch
  }
)(Form.create()(JobEdit));

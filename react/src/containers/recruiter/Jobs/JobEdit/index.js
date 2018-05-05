import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Select, Switch, Popover, Button, notification, Tooltip } from 'antd';

import { saveJob, uploadPitch } from 'redux/recruiter/jobs';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import {
  PageHeader,
  PageSubHeader,
  PopupProgress,
  ImageSelector,
  NoLabelField,
  PitchSelector,
  Icons,
  LinkButton,
  ShareDialog
} from 'components';
import Wrapper from '../styled';
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
    pitchData: null,
    showShare: false
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

  openShareDialog = () => {
    this.setState({ showShare: true });
  };

  closeShareDialog = () => {
    this.setState({ showShare: false });
  };

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
    const { form, workplace, job, saveJob, history } = this.props;

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
        onSuccess: ({ id }) => {
          if (this.state.pitchData) {
            this.uploadPitch(id);
          } else {
            notification.success({
              message: 'Notification',
              description: 'Job is saved successfully.'
            });
            if (job) {
              this.goJobList();
            } else {
              history.push(`/recruiter/jobs/job/view/${id}`);
            }
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

  uploadPitch = id => {
    const { job, uploadPitch, history } = this.props;
    uploadPitch({
      job: id,
      data: this.state.pitchData,
      onSuccess: msg => {
        notification.success({
          message: 'Notification',
          description: 'Job is saved successfully.'
        });
        if (job) {
          this.goJobList();
        } else {
          history.push(`/recruiter/jobs/job/view/${id}`);
        }
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

  changePitch = pitchData => {
    this.setState({ pitchData });
  };

  render() {
    const { logo, loading, showShare } = this.state;
    const { workplace, job, form } = this.props;
    const { getFieldDecorator } = form;
    const pitch = helper.getPitch(job);

    const title = job ? 'Edit' : 'Add';

    return (
      <Wrapper className="container">
        <Helmet title={`${title} Job`} />

        <PageHeader>
          <h2>{title} Job</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {workplace && <Link to={`/recruiter/jobs/workplace/${workplace.business_data.id}`}>Workplaces</Link>}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {workplace && <Link to={`/recruiter/jobs/job/${workplace.id}`}>Jobs</Link>}
            </Breadcrumb.Item>
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb>

          {job && (
            <LinkButton onClick={this.openShareDialog}>
              <Icons.ShareAlt style={{ fontSize: '15px' }} />Share
            </LinkButton>
          )}
        </PageSubHeader>

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

            <Item
              label={
                <span>
                  Description&nbsp;
                  <Popover
                    placement="right"
                    content={
                      <span>
                        Don't type in phone numbers or<br />
                        email address here.
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
              <PitchSelector currentPitch={pitch} onChange={this.changePitch} />
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

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}

        {job && showShare && <ShareDialog url={`here share link...`} onClose={this.closeShareDialog} />}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const workplaceId = helper.str2int(match.params.workplaceId);
    const workplace = helper.getItemByID(state.rc_workplaces.workplaces, workplaceId);
    const jobId = helper.str2int(match.params.jobId);
    const { jobs } = state.rc_jobs;
    const job = helper.getItemByID(jobs, jobId);

    // const videos = jobs.filter(item => {
    //   if (item.location === (workplace || {}).id) {
    //     const pitch = helper.getPitch(item);
    //     return pitch.video;
    //   }
    // });
    return {
      workplace: workplace || (job || {}).location_data,
      job
    };
  },
  {
    saveJob,
    uploadPitch
  }
)(Form.create()(JobEdit));

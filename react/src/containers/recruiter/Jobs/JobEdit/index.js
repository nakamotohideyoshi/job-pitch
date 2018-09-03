import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Select, Switch, Popover, Button, notification, Checkbox, Drawer } from 'antd';

import { getJobs, getWorkplaces } from 'redux/selectors';
import { saveJob, uploadPitch } from 'redux/recruiter/jobs';
import { selectBusiness } from 'redux/recruiter/businesses';
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
  SocialShare,
  JobDetails
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
    showPreview: false
  };

  componentDidMount() {
    const { workplace, job, form, selectBusiness } = this.props;

    if (!workplace) {
      this.goBuisinessList();
      return;
    }

    selectBusiness(workplace.business);

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
        description: job.description,
        requires_pitch: job.requires_pitch,
        requires_cv: job.requires_cv
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
    this.props.history.push(`/recruiter/jobs/job/${this.props.workplace.id}`);
  };

  openPreview = () => {
    this.setState({ showPreview: true });
  };

  closePreview = () => {
    this.setState({ showPreview: false });
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
              message: 'Success',
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
            message: 'Error',
            description: error
          });
        },
        onProgress: progress => {
          this.setState({
            loading: {
              label: 'Logo uploading...',
              progress: Math.floor((progress.loaded / progress.total) * 100)
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
          message: 'Success',
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
          message: 'Error',
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
    const { logo, loading, showPreview } = this.state;
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
                        Don't type in phone numbers or
                        <br />
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
                        Record or upload a short video intro to showcase your company.
                        <br />
                        Tell potential candidates about the role, and why it is a great
                        <br />
                        place to work!
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

            <NoLabelField>
              {getFieldDecorator('requires_pitch', { valuePropName: 'checked', initialValue: true })(
                <Checkbox>Require Pitch</Checkbox>
              )}
            </NoLabelField>

            <NoLabelField>
              {getFieldDecorator('requires_cv', { valuePropName: 'checked', initialValue: false })(
                <Checkbox>Require CV</Checkbox>
              )}
            </NoLabelField>

            {job && (
              <Item label="Share" className="share">
                <SocialShare url={`${window.location.origin}/jobseeker/jobs/${job.id}`} />
              </Item>
            )}

            <NoLabelField className="subimt-field">
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              <Button className="btn-preview" onClick={this.openPreview}>
                Preview
              </Button>
              <Button onClick={this.goJobList}>Cancel</Button>
            </NoLabelField>
          </StyledForm>
        </div>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}

        {job && (
          <Drawer placement="right" closable={false} onClose={this.closePreview} visible={showPreview}>
            <JobDetails jobData={job} />
          </Drawer>
        )}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const workplaceId = helper.str2int(match.params.workplaceId);
    const workplace = helper.getItemByID(getWorkplaces(state), workplaceId);
    const jobId = helper.str2int(match.params.jobId);
    const jobs = getJobs(state);
    const job = helper.getItemByID(jobs, jobId);

    return {
      workplace: workplace || (job || {}).location_data,
      job
    };
  },
  {
    saveJob,
    uploadPitch,
    selectBusiness
  }
)(Form.create()(JobEdit));

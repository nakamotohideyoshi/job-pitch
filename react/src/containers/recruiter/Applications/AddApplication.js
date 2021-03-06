import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Select, Input, Button, Switch, InputNumber, Popover, message, Upload } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getJobsSelector } from 'redux/selectors';
import { newApplicationAction } from 'redux/applications';
import { PageHeader, PageSubHeader, NoLabelField, Logo, Icons, PopupProgress } from 'components';
import Wrapper from './AddApplication.styled';

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

/* eslint-disable react/prop-types */
class AddApplication extends React.Component {
  state = {
    cvData: null,
    loading: null
  };

  componentDidMount() {
    const { jobId } = this.props.location.state || {};
    this.props.form.setFieldsValue({
      job: jobId
    });
  }

  goApplicationList = () => {
    this.props.history.push('/recruiter/applications');
  };

  changedCV = info => {
    this.setState({ cvData: info.fileList.length ? info.file : null });
  };

  save = () => {
    this.props.form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      const job_seeker = { ...values };
      delete job_seeker.job;
      delete job_seeker.shortlisted;

      this.props.newApplicationAction({
        data: {
          job: values.job,
          job_seeker,
          shortlisted: values.shortlisted
        },
        onSuccess: () => {
          message.success('The application is saved');
          this.props.history.push(`/recruiter/applications/conns/${values.job}`);
        },
        onFail: error => {
          this.setState({ loading: null });
          message.error(error);
        }
      });
    });
  };

  render() {
    const { jobs, form } = this.props;
    const { cvData, loading } = this.state;
    const { getFieldDecorator } = form;

    return (
      <Wrapper className="container">
        <Helmet title="Add Application" />

        <PageHeader>
          <h2>Add Application</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/applications">Applications</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Add</Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        <div className="content">
          <Form>
            <Item label="Job">
              {getFieldDecorator('job', {
                rules: [{ required: true, message: 'Please select job!' }]
              })(
                <Select
                  showSearch
                  placeholder="Select a job"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {jobs.map(job => {
                    const logo = helper.getJobLogo(job);
                    return (
                      <Option key={job.id} value={job.id}>
                        <Logo src={logo} className="logo" size="22px" />
                        {job.title}
                        <span className="right-menu-item">
                          {job.location_data.name}, {job.location_data.business_data.name}
                        </span>
                      </Option>
                    );
                  })}
                </Select>
              )}
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

            <Item label="Email">
              {getFieldDecorator('email', {
                rules: [{ type: 'email', message: 'The input is not valid email!' }]
              })(<Input />)}
            </Item>

            <Item label="Telephone">{getFieldDecorator('telephone')(<Input />)}</Item>

            <Item label="Phone number">{getFieldDecorator('mobile')(<Input />)}</Item>

            <Item label="Age">{getFieldDecorator('age')(<InputNumber min={1} />)}</Item>

            <Item label="Gender">
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

            <Item label="Nationality">
              {getFieldDecorator('nationality')(
                <Select
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {DATA.nationalities.map(({ id, name }) => (
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
              <Upload.Dragger beforeUpload={() => false} fileList={cvData ? [cvData] : []} onChange={this.changedCV}>
                <p className="ant-upload-text">
                  <Icons.CloudUpload /> Click or drag file to this area to upload CV
                </p>
                <p className="ant-upload-hint">
                  Upload your CV using your favourite cloud service, or take a photo if you have it printed out.
                </p>
              </Upload.Dragger>
            </NoLabelField>

            <Item label="Shortlisted">
              {getFieldDecorator('shortlisted', { valuePropName: 'checked', initialValue: false })(<Switch />)}
            </Item>

            <NoLabelField>
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              <Button onClick={this.goApplicationList}>Cancel</Button>
            </NoLabelField>
          </Form>
        </div>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobs: getJobsSelector(state).filter(({ status }) => status === DATA.JOB.OPEN)
  }),
  { newApplicationAction }
)(Form.create()(AddApplication));

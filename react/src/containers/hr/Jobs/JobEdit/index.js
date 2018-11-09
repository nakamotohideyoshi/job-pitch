import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Select, Popover, Button, message } from 'antd';

import * as helper from 'utils/helper';
import { getHrWorkplacesSelector, getHrJobsSelector } from 'redux/selectors';
import { saveJobAction } from 'redux/hr/jobs';
import { PageHeader, NoLabelField, Icons, PopupProgress, Logo } from 'components';
import Wrapper from './styled';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

/* eslint-disable react/prop-types */
class JobEdit extends React.Component {
  state = {
    loading: null
  };

  componentDidMount() {
    const { job, form } = this.props;

    if (job) {
      form.setFieldsValue({
        title: job.title,
        location: job.location,
        description: job.description
      });
    }
  }

  goJobList = () => {
    this.props.history.push(`/hr/jobs`);
  };

  save = () => {
    const { form, job, saveJobAction, history } = this.props;

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

      saveJobAction({
        data: {
          ...values,
          id: (job || {}).id
        },
        success: () => {
          message.success('Job is saved successfully.');
          history.push('/hr/jobs');
        },
        fail: () => {
          message.error('There was an error saving the job');
          this.setState({ loading: null });
        }
      });
    });
  };

  render() {
    const { loading } = this.state;
    const { workplaces, job, form } = this.props;
    const { getFieldDecorator } = form;
    const title = job ? 'Edit' : 'Add';

    return (
      <Wrapper className="container">
        <Helmet title={`${title} Job`} />

        <PageHeader>
          <h2>{title} Job</h2>
          <Link to="/hr/jobs">Job List</Link>
        </PageHeader>

        <div className="content">
          <Form>
            <Item label="Workplace">
              {getFieldDecorator('location', {
                rules: [{ required: true, message: 'Please select workplace!' }]
              })(
                <Select
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {workplaces.map(workplace => (
                    <Option value={workplace.id} key={workplace.id}>
                      <Logo src={helper.getWorkplaceLogo(workplace)} className="logo" size="22px" />
                      {workplace.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Item>

            <Item label="Title">
              {getFieldDecorator('title', {
                rules: [
                  { required: true, message: 'Please input job title!' },
                  { whitespace: true, message: 'This field may not be blank.' }
                ]
              })(<Input autoFocus />)}
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

            <NoLabelField className="subimt-field">
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              <Button onClick={this.goJobList}>Cancel</Button>
            </NoLabelField>
          </Form>
        </div>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const workplaces = getHrWorkplacesSelector(state);
    const jobId = helper.str2int(match.params.jobId);
    const jobs = getHrJobsSelector(state);
    const job = helper.getItemById(jobs, jobId);

    return {
      workplaces,
      job
    };
  },
  {
    saveJobAction
  }
)(Form.create()(JobEdit));

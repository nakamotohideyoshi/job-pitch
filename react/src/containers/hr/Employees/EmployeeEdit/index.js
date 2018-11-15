import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Form, Input, Select, Popover, Button, DatePicker, message } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getHrBusinessesSelector, getHrJobsSelector, getHrEmployeesSelector } from 'redux/selectors';
import { saveEmployeeAction } from 'redux/hr/employees';
import { PageHeader, PopupProgress, Icons, ImageSelector, NoLabelField } from 'components';
import DefaultAvatar from 'assets/avatar.png';
import Wrapper from './styled';

const { Item } = Form;
const { Option } = Select;

/* eslint-disable react/prop-types */
class EmployeeEdit extends React.Component {
  state = {
    avatar: {
      url: null,
      file: null,
      exist: false
    },
    loading: null
  };

  componentDidMount() {
    const { employee, form } = this.props;

    if (employee) {
      this.setState({
        avatar: {
          url: employee.profile_thumb || DefaultAvatar,
          exist: employee.profile_thumb
        }
      });

      form.setFieldsValue({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        telephone: employee.telephone,
        sex: employee.sex,
        nationality: employee.nationality,
        birthday: employee.birthday ? moment(employee.birthday) : null,
        national_insurance_number: employee.national_insurance_number,
        business: employee.business,
        job: employee.job
      });
    } else {
      this.setState({
        avatar: {
          url: DefaultAvatar,
          exist: false
        }
      });
    }
  }

  goEmployeeList = () => {
    this.props.history.push('/hr/employees');
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

  save = () => {
    const { form, saveEmployeeAction, employee } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      const { avatar } = this.state;
      const data = { ...values };
      if (values.birthday) {
        data.birthday = values.birthday.format('YYYY-MM-DD');
      }
      if (avatar.file || ((employee || {}).profile_image && !avatar.exist)) {
        data.profile_image = avatar.file;
      }

      saveEmployeeAction({
        isFormData: true,
        id: (employee || {}).id,
        data,
        success: () => {
          message.success('The employee is saved');
          this.goEmployeeList();
        },
        fail: data => {
          this.setState({ loading: null });
          helper.setErrors(form, data, values);
        },
        onUploadProgress: data.profile_image
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

  render() {
    const { avatar, loading } = this.state;
    const { employee, jobs, businesses, form } = this.props;
    const { getFieldDecorator } = form;
    const title = employee ? 'Edit' : 'Add';

    return (
      <Wrapper className="container">
        <Helmet title={`${title} Employee`} />

        <PageHeader>
          <h2>{title} Employee</h2>
          <Link to="/hr/employees">Employee List</Link>
        </PageHeader>

        <div className="content">
          <Form>
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

            <Item label="Email">
              {getFieldDecorator('email', {
                rules: [{ type: 'email', message: 'The input is not valid email!' }]
              })(<Input />)}
            </Item>

            <Item label="Telephone">{getFieldDecorator('telephone')(<Input />)}</Item>

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

            <Item label="Birthday">{getFieldDecorator('birthday')(<DatePicker format="YYYY-MM-DD" />)}</Item>

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

            <Item label="Business">
              {getFieldDecorator('business', {
                rules: [{ required: true, message: 'Please select business!' }]
              })(
                <Select
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {businesses.map(({ id, name }) => (
                    <Option value={id} key={id}>
                      {name}
                    </Option>
                  ))}
                </Select>
              )}
            </Item>

            <Item label="Job">
              {getFieldDecorator('job', {
                rules: [{ required: true, message: 'Please select job!' }]
              })(
                <Select
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {jobs.map(({ id, title }) => (
                    <Option value={id} key={id}>
                      {title}
                    </Option>
                  ))}
                </Select>
              )}
            </Item>

            <NoLabelField className="subimt-field">
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              <Button onClick={this.goEmployeeList}>Cancel</Button>
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
    const employeeId = helper.str2int(match.params.employeeId);
    const employee = helper.getItemById(getHrEmployeesSelector(state), employeeId);
    return {
      employee,
      jobs: getHrJobsSelector(state),
      businesses: getHrBusinessesSelector(state)
    };
  },
  {
    saveEmployeeAction
  }
)(Form.create()(EmployeeEdit));

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Select, Button, notification, Checkbox } from 'antd';

import { saveUser, resendInvitation } from 'redux/recruiter/users';
// import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, PopupProgress, NoLabelField } from 'components';
import Wrapper from '../styled';
import StyledForm from './styled';

const { Item } = Form;
const { Option } = Select;

class UserEdit extends React.Component {
  state = {
    loading: null,
    isAdmin: false
  };

  componentDidMount() {
    const { business, user, form } = this.props;

    if (!business) {
      this.goBuisinessList();
      return;
    }

    if (user) {
      form.setFieldsValue({
        email: user.email,
        locations: user.locations
      });
      if (user.locations.length === 0) {
        this.setState({
          isAdmin: true
        });
      }
    }
  }

  goBuisinessList = () => {
    this.props.history.push('/recruiter/users/business');
  };

  goUserList = () => {
    const { business: { id }, history } = this.props;
    history.push(`/recruiter/users/${id}`);
  };

  save = () => {
    const { form, user, saveUser, business } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });
      saveUser({
        data: user
          ? {
              locations: values.locations === undefined ? [] : values.locations
            }
          : {
              email: values.email,
              locations: values.locations === undefined ? [] : values.locations
            },
        businessId: business.id,
        userId: (user || {}).id,
        onSuccess: ({ id }) => {
          notification.success({
            message: 'Notification',
            description: 'User is saved successfully.'
          });
          this.goUserList();
        },
        onFail: error => {
          this.setState({ loading: null });
          notification.error({
            message: 'Notification',
            description: error
          });
        }
      });
    });
  };

  resendInvitation = () => {
    const { user, resendInvitation, business } = this.props;

    this.setState({
      loading: {
        label: 'Sending...'
      }
    });
    resendInvitation({
      businessId: business.id,
      userId: user.id,
      onSuccess: ({ id }) => {
        notification.success({
          message: 'Notification',
          description: 'Invitation is sent successfully.'
        });
        this.goUserList();
      },
      onFail: error => {
        this.setState({ loading: null });
        notification.error({
          message: 'Notification',
          description: error
        });
      }
    });
  };

  render() {
    const { loading } = this.state;
    const { business, workplaces, user, form } = this.props;
    const { getFieldDecorator } = form;
    const title = user ? 'Edit' : 'Add';

    return (
      <Wrapper className="container">
        <Helmet title={`${title} User`} />

        <PageHeader>
          <h2>{title} User</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/users/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/recruiter/users/${business.id}`}>Users</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        <div className="content">
          <StyledForm>
            <Item label="Email">
              {getFieldDecorator('email', {
                initialValue: user ? user.email : '',
                rules: [{ type: 'email', required: true, message: 'The input is not valid email!' }]
              })(user ? <Input disabled /> : <Input />)}
            </Item>

            <NoLabelField>
              {getFieldDecorator('isAdmin', { valuePropName: 'checked', initialValue: this.state.isAdmin })(
                <Checkbox onClick={() => this.setState({ isAdmin: !this.state.isAdmin })}>Administrator</Checkbox>
              )}
            </NoLabelField>
            {!this.state.isAdmin && (
              <Item label="Workplaces">
                {getFieldDecorator('locations', {
                  rules: [{ required: true, message: 'Please select workplace!' }]
                })(
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {workplaces.map(({ id, name }) => (
                      <Option value={id} key={id}>
                        {name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Item>
            )}
            <NoLabelField className="subimt-field">
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              {user && (
                <Button type="primary" onClick={this.resendInvitation}>
                  Resend Invitation
                </Button>
              )}
              <Button onClick={this.goUserList}>Cancel</Button>
            </NoLabelField>
          </StyledForm>
        </div>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const businessId = helper.str2int(match.params.businessId);
    const business = helper.getItemByID(state.rc_businesses.businesses, businessId);
    let { workplaces } = state.rc_workplaces;
    workplaces = workplaces.filter(item => item.business === businessId);
    const userId = helper.str2int(match.params.userId);
    const { users } = state.rc_users;
    const user = helper.getItemByID(users, userId);

    return {
      business,
      workplaces,
      user
    };
  },
  {
    saveUser,
    resendInvitation
  }
)(Form.create()(UserEdit));

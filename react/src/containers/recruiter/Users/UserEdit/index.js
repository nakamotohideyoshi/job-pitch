import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Select, Button, Checkbox, message } from 'antd';

import * as helper from 'utils/helper';
import { getWorkplacesSelector, getUsersSelelctor } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import { saveUserAction, resendInvitationAction } from 'redux/recruiter/users';
import { PageHeader, PopupProgress, NoLabelField, Logo } from 'components';
import Wrapper from './styled';

const { Item } = Form;
const { Option } = Select;

/* eslint-disable react/prop-types */
class UserEdit extends React.Component {
  state = {
    loading: null,
    isAdmin: false
  };

  componentDidMount() {
    const { business, user, form, selectBusinessAction } = this.props;

    if (!business || business.restricted) {
      this.props.history.replace('/recruiter/users/business');
      return;
    }

    selectBusinessAction(business.id);

    if (user) {
      form.setFieldsValue({
        email: user.email,
        locations: user.locations
      });

      if (user.locations.length === 0) {
        this.setState({ isAdmin: true });
      }
    }
  }

  goUserList = () => {
    this.props.history.push('/recruiter/users/business');
  };

  save = () => {
    const { form, saveUserAction, user, business } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      const locations = values.locations || [];
      saveUserAction({
        data: user
          ? { locations }
          : {
              email: values.email,
              locations
            },
        businessId: business.id,
        id: (user || {}).id,
        success: () => {
          message.success('The user is saved');
          this.goUserList();
        },
        fail: data => {
          this.setState({ loading: null });
          helper.setErrors(form, data, values);
        }
      });
    });
  };

  resendInvitation = () => {
    const { user, resendInvitationAction, business } = this.props;

    this.setState({
      loading: {
        label: 'Sending...'
      }
    });

    resendInvitationAction({
      businessId: business.id,
      id: user.id,
      success: () => {
        message.success('Invitation is sent successfully.');
        this.goUserList();
      },
      fail: () => {
        this.setState({ loading: null });
        message.error('There was an error sending invitation');
      }
    });
  };

  render() {
    const { loading, isAdmin } = this.state;
    const { business, workplaces, user, form } = this.props;
    const { getFieldDecorator } = form;
    const title = business ? 'Edit' : 'Add';

    return (
      <Wrapper className="container">
        <Helmet title={`${title} User`} />

        <PageHeader>
          <h2>{title} User</h2>
          <Link to="/recruiter/users/business">User List</Link>
        </PageHeader>

        <div className="content">
          <Form>
            <Item label="Email">
              {getFieldDecorator('email', {
                rules: [
                  { type: 'email', message: 'The input is not valid email!' },
                  { required: true, message: `Please input user's email!` }
                ]
              })(<Input disabled={!!user} />)}
            </Item>

            <NoLabelField>
              <Checkbox
                checked={isAdmin}
                onClick={e => {
                  this.setState({ isAdmin: e.target.checked });
                }}
              >
                Administrator
              </Checkbox>
            </NoLabelField>

            {!isAdmin && (
              <Item label="Workplaces">
                {getFieldDecorator('locations', {
                  rules: [{ required: true, message: 'Please select workplaces!' }]
                })(
                  <Select
                    mode="multiple"
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
          </Form>
        </div>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const userId = helper.str2int(match.params.userId);
    const user = helper.getItemById(getUsersSelelctor(state), userId);
    const businessId = helper.str2int(match.params.businessId) || (user || {}).business;
    const business = helper.getItemById(state.businesses.businesses, businessId);
    return {
      business,
      workplaces: getWorkplacesSelector(state),
      user
    };
  },
  {
    selectBusinessAction,
    saveUserAction,
    resendInvitationAction
  }
)(Form.create()(UserEdit));

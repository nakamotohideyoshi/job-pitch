import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, message } from 'antd';

import { changePassword } from 'redux/auth';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import FormWrapper from './styled';

const { Item } = Form;

class PasswordForm extends React.Component {
  state = {
    loading: false
  };

  changePassword = e => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({ loading: true });
      this.props.changePassword({
        data: values,
        success: ({ success }) => {
          this.setState({ loading: false });
          message.success(success);
        },
        fail: data => {
          this.setState({ loading: false });
          helper.setErrors(form, data, values);
        }
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;

    return (
      <FormWrapper onSubmit={this.changePassword}>
        <label>Email</label>
        <Item>
          <Input disabled value={DATA.email} />
        </Item>

        <label>New password</label>
        <Item>
          {getFieldDecorator('new_password1', {
            rules: [
              { required: true, message: 'Please confirm your password!' },
              { whitespace: true, message: 'This field may not be blank.' }
            ]
          })(<Input type="password" />)}
        </Item>

        <label>Confirm Password</label>
        <Item>
          {getFieldDecorator('new_password2', {
            rules: [
              { required: true, message: 'Please confirm your password!' },
              { whitespace: true, message: 'This field may not be blank.' }
            ]
          })(<Input type="password" />)}
        </Item>

        <Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update password
          </Button>
        </Item>
      </FormWrapper>
    );
  }
}

export default connect(null, { changePassword })(Form.create()(PasswordForm));

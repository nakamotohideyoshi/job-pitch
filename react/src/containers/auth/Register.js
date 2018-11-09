import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';

import * as helper from 'utils/helper';
import { registerAction } from 'redux/auth';

import Wrapper from './styled';

const { Item } = Form;

/* eslint-disable react/prop-types */
class RegisterForm extends React.Component {
  state = {
    loading: false
  };

  componentDidMount() {
    this.refEmail.focus();
  }

  register = e => {
    e.preventDefault();

    const { form, registerAction, history } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({ loading: true });

      registerAction({
        data: values,

        success: () => {
          history.push('/select');
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
      <Wrapper className="container">
        <Helmet title="Create account" />

        <Form onSubmit={this.register} className="shadow">
          <h1>Create account</h1>

          <label>Email Address</label>

          <Item>
            {getFieldDecorator('email', {
              rules: [
                { type: 'email', message: 'The input is not valid email!' },
                { required: true, message: 'Please input your email!' }
              ]
            })(
              <Input
                type="email"
                ref={ref => {
                  this.refEmail = ref;
                }}
              />
            )}
          </Item>

          <label>Password</label>
          <Item>
            {getFieldDecorator('password1', {
              rules: [
                { required: true, message: 'Please input your password!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<Input type="password" />)}
          </Item>

          <label>Confirm Password</label>
          <Item>
            {getFieldDecorator('password2', {
              rules: [
                { required: true, message: 'Please confirm your password!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<Input type="password" />)}
          </Item>

          <Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Register
            </Button>
          </Item>
        </Form>

        <div>
          Have an account? <Link to="/auth">Sign in</Link>
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  null,
  { registerAction }
)(Form.create()(RegisterForm));

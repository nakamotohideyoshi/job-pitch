import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';

import * as helper from 'utils/helper';
import { loginAction } from 'redux/auth';

import Wrapper from './styled';

const { Item } = Form;

/* eslint-disable react/prop-types */
class LoginForm extends React.Component {
  state = {
    loading: false
  };

  componentDidMount() {
    this.refEmail.focus();
  }

  login = e => {
    e.preventDefault();

    const { form, loginAction, location, history } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({ loading: true });

      loginAction({
        data: values,

        success: () => {
          const { from } = location.state || {};
          if (from) {
            history.push(from.pathname);
          } else {
            history.push('/select');
          }
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
        <Helmet title="Sign in" />

        <Form onSubmit={this.login} className="shadow">
          <h1>Sign in</h1>

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
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: 'Please input your password!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<Input type="password" />)}
          </Item>

          <Item>
            <Link to="/auth/reset">Forgot password</Link>
            <Button type="primary" htmlType="submit" loading={loading}>
              Sign in
            </Button>
          </Item>
        </Form>

        <div>
          Don't have an account? <Link to="/auth/register">Sign up</Link>
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  null,
  { loginAction }
)(Form.create()(LoginForm));

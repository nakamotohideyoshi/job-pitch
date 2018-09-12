import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';

import * as helper from 'utils/helper';
import { login, logout } from 'redux/auth';

import Wrapper from './styled';

const { Item } = Form;

class LoginForm extends React.Component {
  state = {
    loading: false
  };

  componentDidMount() {
    this.props.logout();
    this.refEmail.focus();
  }

  login = e => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({ loading: true });
      this.props.login({
        data: values,
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

        <Form onSubmit={this.login} className="shadow1">
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
          Not registered? <Link to="/auth/register">Sign up</Link>
        </div>
      </Wrapper>
    );
  }
}

export default connect(null, { login, logout })(Form.create()(LoginForm));

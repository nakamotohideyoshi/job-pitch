import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';

import { register } from 'redux/auth';
import * as helper from 'utils/helper';

import Wrapper from './styled';

const { Item } = Form;

class RegisterForm extends React.Component {
  state = {
    loading: false
  };

  componentDidMount() {
    this.refEmail.focus();
  }

  register = e => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({ loading: true });
      this.props.register({
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
        <Helmet title="Create account" />

        <Form onSubmit={this.register} className="shadow1">
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
          Already registered? <Link to="/auth">Sign in</Link>
        </div>
      </Wrapper>
    );
  }
}

export default connect(null, { register })(Form.create()(RegisterForm));

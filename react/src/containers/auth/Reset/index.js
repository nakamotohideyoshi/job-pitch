import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';

import { resetPassword } from 'redux/auth';
import * as helper from 'utils/helper';

import Wrapper from './styled';

const { Item } = Form;

class ResetForm extends React.Component {
  state = {
    loading: false,
    sent: false
  };

  componentDidMount() {
    this.refEmail.focus();
  }

  resetPassword = e => {
    e.preventDefault();

    const { history, form } = this.props;

    if (this.state.sent) {
      history.push('/auth');
      return;
    }

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({ loading: true });
      this.props.resetPassword({
        data: values,
        success: () => this.setState({ loading: false, sent: true }),
        fail: data => {
          this.setState({ loading: false });
          helper.setErrors(form, data, values);
        }
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, sent } = this.state;

    return (
      <Wrapper className="container">
        <Helmet title="Reset Password" />

        <Form onSubmit={this.resetPassword} className="shadow1">
          <h1>Reset Password</h1>

          {!sent && <label>Email Address</label>}
          <Item>
            {!sent ? (
              getFieldDecorator('email', {
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
              )
            ) : (
              <Alert message="Password reset requested, please check your email." type="success" />
            )}
          </Item>

          <Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {!sent ? 'Send reset email' : 'Return to sign in'}
            </Button>
          </Item>
        </Form>

        <div>
          Return to <Link to="/auth">Sign in</Link>
        </div>
      </Wrapper>
    );
  }
}

export default connect(null, { resetPassword })(Form.create()(ResetForm));

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import cookie from 'js-cookie';
import { Link, browserHistory } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { FormComponent } from 'components';
import * as authActions from 'redux/modules/auth';

@connect(
  state => ({
    loading: state.auth.loading,
  }),
  { ...authActions }
)
export default class Login extends FormComponent {
  static propTypes = {
    login: PropTypes.func.isRequired,
    loading: PropTypes.bool,
  };

  onLogin = () => {
    if (!this.isValid(['email', 'password'])) return;

    const { formModel } = this.state;
    this.props.login(formModel)
    .then(data => {
      if (__DEVELOPMENT__) {
        cookie.set('token', data.key);
      }
      localStorage.setItem('email', formModel.email);
      browserHistory.push('/select');
    })
    .catch(errors => this.setState({ errors }));
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.onLogin();
    }
  }

  render() {
    return (
      <div className="form">
        <Helmet title="Login" />
        <h1>Login</h1>
        <div className="content">
          <Form>
            <FormGroup>
              <this.TextField
                type="text"
                placeholder="Email Address"
                name="email"
              />
            </FormGroup>
            <FormGroup>
              <this.TextField
                type="password"
                placeholder="Password"
                name="password"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.props.loading}
                labels={['Login', 'Login...']}
                onClick={this.onLogin}
                style={{ width: '100%' }}
              />
            </FormGroup>
          </Form>
          <div>
            <Link to="/register">Not registered?</Link>
            <Link to="/reset" style={{ float: 'right' }}>Forgot Password?</Link>
          </div>
        </div>
      </div>
    );
  }
}

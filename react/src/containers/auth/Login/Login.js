import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import { loginAction } from 'redux/modules/auth';

@connect(
  state => ({
    loading: state.auth.loading,
  }),
  { loginAction }
)
export default class Login extends FormComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    loginAction: PropTypes.func.isRequired,
  };

  onLogin = () => {
    if (this.isValid(['email', 'password'])) {
      this.props.loginAction(this.state.formModel)
        .then(() => browserHistory.push('/select'))
        .catch(errors => this.setState({ errors }));
    }
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.onLogin();
    }
  }

  render() {
    return (
      <div className="home-container">
        <Helmet title="Login" />

        <div className="board padding-45">
          <h3>Login</h3>
          <Form>
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <this.TextField
                type="text"
                name="email"
              />
            </FormGroup>
            <FormGroup>
              <div>
                <ControlLabel>Password</ControlLabel>
                <Link to="/reset" tabIndex="-1">Forgot Password?</Link>
              </div>
              <this.TextField
                type="password"
                name="password"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.props.loading}
                labels={['Login', 'Login...']}
                onClick={this.onLogin}
              />
            </FormGroup>
          </Form>
        </div>

        <br />
        <div className="board1">
          { 'Not registered? ' }
          <Link className="link" to="/register" tabIndex="-1">Sign Up</Link>
        </div>
      </div>
    );
  }
}

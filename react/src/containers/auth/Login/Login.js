import React from 'react';
import Helmet from 'react-helmet';
import { Link, browserHistory } from 'react-router';
import Scroll from 'react-scroll';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './Login.scss';

export default class Login extends FormComponent {

  onLogin = () => {
    if (this.isValid(['email', 'password'])) {
      const { formModel } = this.state;
      this.setState({ loading: true });
      ApiClient.shared().login(formModel).then(
        () => {
          utils.setCookie('email', formModel.email);
          browserHistory.push('/select');
        },
        errors => {
          this.setState({
            loading: false,
            errors
          });
        }
      );
    }
  }

  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.onLogin();
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <Helmet title="Login" />

        <div className="board padding-45">
          <h3>Login</h3>

          <Form>
            <FormGroup>
              <Scroll.Element name="email">
                <ControlLabel>Email Address</ControlLabel>
              </Scroll.Element>
              <this.TextField
                type="email"
                name="email"
              />
            </FormGroup>
            <FormGroup>
              <Scroll.Element name="password">
                <div>
                  <ControlLabel>Password</ControlLabel>
                  <Link to="/reset" tabIndex="-1">Forgot Password?</Link>
                </div>
              </Scroll.Element>
              <this.TextField
                type="password"
                name="password"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.state.loading}
                labels={['Login', 'Login...']}
                onClick={this.onLogin}
              />
            </FormGroup>
          </Form>
        </div>

        <br />
        <div className="board">
          { 'Not registered? ' }
          <Link className="link" to="/register" tabIndex="-1">Sign Up</Link>
        </div>
      </div>
    );
  }
}

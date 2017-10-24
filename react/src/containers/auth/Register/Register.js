import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Scroll from 'react-scroll';
import { Link, browserHistory } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './Register.scss';

export default class Register extends FormComponent {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  onRegister = () => {
    if (this.isValid(['email', 'password1', 'password2'])) {
      const { formModel } = this.state;
      this.setState({ loading: true });

      ApiClient.shared().register(formModel)
        .then(() => ApiClient.shared().login({
          email: formModel.email,
          password: formModel.password1
        }))
        .then(() => {
          utils.setCookie('email', this.state.formModel.email);
          if (this.props.params.type) {
            utils.setShared('usertype', this.props.params.type);
            utils.setShared('first-time', '1');
          }
          browserHistory.push('/select');
        })
        .catch(errors => this.setState({
          loading: false,
          errors
        }));
    }
  }

  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.onRegister();
    }
  }

  render() {
    const { type } = this.props.params;
    let buttonText = 'Register';
    if (type) {
      buttonText = type === 'jobseeker' ? "I'm a Job Seeker" : "I'm a Recruiter";
    }

    return (
      <div className={styles.root}>
        <Helmet title="Register" />

        <div className="board padding-45">
          <h3>Register</h3>

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
              <Scroll.Element name="password1">
                <ControlLabel>Password</ControlLabel>
              </Scroll.Element>
              <this.TextField
                type="password"
                name="password1"
              />
            </FormGroup>
            <FormGroup>
              <Scroll.Element name="password2">
                <ControlLabel>Confirm Password</ControlLabel>
              </Scroll.Element>
              <this.TextField
                type="password"
                name="password2"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>

            <FormGroup>
              <this.SubmitButton
                bsStyle={type === 'jobseeker' ? 'warning' : 'success'}
                submtting={this.state.loading}
                labels={[buttonText, 'Registering...']}
                onClick={() => this.onRegister()}
              />
            </FormGroup>
          </Form>
        </div>

        <br />
        <div className="board">
          { 'Already registered? ' }
          <Link className="link" to="/login" tabIndex="-1">Login</Link>
        </div>
      </div>
    );
  }
}

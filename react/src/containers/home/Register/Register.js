import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import cookie from 'js-cookie';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { FormComponent } from 'components';
import * as authActions from 'redux/modules/auth';

@connect(
  state => ({
    loading: state.auth.loading,
  }),
  { ...authActions })
export default class Register extends FormComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    register: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
  }

  onRegister = type => {
    if (!this.isValid(['email', 'password1', 'password2'])) return;

    const { formModel } = this.state;
    this.props.register(formModel)
    .then(() => this.props.login({
      email: formModel.email,
      password: formModel.password1
    }))
    .then(data => {
      if (__DEVELOPMENT__) {
        cookie.set('token', data.key);
      }
      if (type) {
        cookie.set('usertype', type);
      } else {
        cookie.set('usertype', this.props.params.type);
      }
      localStorage.setItem('email', formModel.email);
      browserHistory.push('/select');
    })
    .catch(errors => this.setState({ errors }));
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.onRegister();
    }
  }

  render() {
    const { type } = this.props.params;
    let title = 'Register';
    if (type) {
      title = type === 'recruiter' ? 'Recruiter' : 'JobSeeker';
    }
    return (
      <div className="form">
        <Helmet title={title} />
        <h1>{title}</h1>
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
                name="password1"
              />
            </FormGroup>
            <FormGroup>
              <this.TextField
                type="password"
                placeholder="Confirm Password"
                name="password2"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              {
                type ?
                  <this.SubmitButton
                    submtting={this.props.loading}
                    labels={['Register', 'Registering...']}
                    onClick={() => this.onRegister()}
                    style={{ width: '100%' }}
                  /> :
                  <div>
                    <this.SubmitButton
                      bsStyle="success"
                      submtting={this.props.loading}
                      labels={['Recruiter', 'Registering...']}
                      onClick={() => this.onRegister('recruiter')}
                      style={{ width: '100%', marginBottom: '10px' }}
                    />
                    <this.SubmitButton
                      bsStyle="warning"
                      submtting={this.props.loading}
                      labels={['JobSeeker', 'Registering...']}
                      onClick={() => this.onRegister2('jobseeker')}
                      style={{ width: '100%' }}
                    />
                  </div>
              }
            </FormGroup>
          </Form>
          <Link to="/login">Already registered? Click here to login.</Link>
        </div>
      </div>
    );
  }
}

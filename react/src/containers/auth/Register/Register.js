import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import { registerAction } from 'redux/modules/auth';

@connect(
  state => ({
    loading: state.auth.loading,
  }),
  { registerAction }
)
export default class Register extends FormComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    registerAction: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
  }

  onRegister = type => {
    if (this.isValid(['email', 'password1', 'password2'])) {
      this.props.registerAction(this.state.formModel, type || this.props.params.type)
        .then(() => browserHistory.push('/select'))
        .catch(errors => this.setState({ errors }));
    }
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.onRegister();
    }
  }

  render() {
    const { type } = this.props.params;

    return (
      <div className="home-container">
        <Helmet title="Register" />

        <div className="board padding-45">
          <h3>Register</h3>
          <Form>
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <this.TextField
                type="text"
                name="email"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Password</ControlLabel>
              <this.TextField
                type="password"
                name="password1"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Confirm Password</ControlLabel>
              <this.TextField
                type="password"
                name="password2"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              {
                (!type || type === 'recruiter') &&
                <this.SubmitButton
                  bsStyle="success"
                  submtting={this.props.loading}
                  labels={["I'm a Recruiter", 'Registering...']}
                  onClick={() => this.onRegister('recruiter')}
                />
              }
              {
                (!type || type === 'jobseeker') &&
                <this.SubmitButton
                  bsStyle="warning"
                  submtting={this.props.loading}
                  labels={["I'm a JobSeeker", 'Registering...']}
                  onClick={() => this.onRegister2('jobseeker')}
                />
              }
            </FormGroup>
          </Form>
        </div>

        <br />
        <div className="board1">
          { 'Already registered? ' }
          <Link className="link" to="/login" tabIndex="-1">Login</Link>
        </div>
      </div>
    );
  }
}

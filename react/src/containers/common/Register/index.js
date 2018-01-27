import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Alert, Container } from 'reactstrap';

import { FormComponent, Board } from 'components';
import { register } from 'redux/auth';
import Wrapper from './Wrapper';

const BUTTON_TEXT = {
  default: 'Register',
  recruiter: "I'm a Recruiter",
  jobseeker: "I'm a Jobseeker"
};

class Register extends FormComponent {
  componentDidMount() {
    this.inputs.email.focus();
  }

  handleRegister = () => {
    if (this.isValid(['email', 'password1', 'password2'])) {
      this.props.register(this.state.model, this.props.match.params.type);
    }
  };

  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.handleRegister();
    }
  };

  render() {
    const { loading } = this.props;
    const error = this.getError();

    const type = this.props.match.params.type || 'default';
    let buttonText = BUTTON_TEXT[type];

    return (
      <Wrapper>
        <Helmet title="Register" />

        <Container>
          <Board className="board">
            <h2>Create account</h2>
            <hr />

            {error && <Alert color="danger">{error}</Alert>}

            <Form>
              <FormGroup>
                <Label>Email Address</Label>
                <this.FormInput
                  type="email"
                  // placeholder="Email Address"
                  name="email"
                  onKeyUp={this.onKeyUp}
                />
              </FormGroup>

              <FormGroup>
                <Label>Password</Label>
                <this.FormInput
                  type="password"
                  // placeholder="Password"
                  name="password1"
                  onKeyUp={this.onKeyUp}
                />
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <this.FormInput
                  type="password"
                  // placeholder="Confirm Password"
                  name="password2"
                  onKeyUp={this.onKeyUp}
                />
              </FormGroup>

              <Button
                color={type === 'jobseeker' ? 'yellow' : 'green'}
                disabled={loading}
                onClick={this.handleRegister}
                block
              >
                {buttonText}
                {loading && '...'}
              </Button>
            </Form>
          </Board>

          <div className="signin">
            {'Already registered? '}
            <Link to="/auth">Sign in</Link>
          </div>
        </Container>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    loading: state.auth.loading,
    errors: state.auth.errors
  }),
  { register }
)(Register);

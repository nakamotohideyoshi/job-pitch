import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Alert } from 'reactstrap';

import { FormComponent, Board } from 'components';
import { login } from 'redux/auth';
import Container from './Wrapper';

class Login extends FormComponent {
  componentDidMount() {
    this.inputs.email.focus();
  }

  handleLogin = () => {
    if (this.isValid(['email', 'password'])) {
      this.props.login(this.state.model);
    }
  };

  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.handleLogin();
    }
  };

  render() {
    const { loading } = this.props;
    const error = this.getError();

    return (
      <Fragment>
        <Helmet title="Login" />

        <Container>
          <Board className="board">
            <h2>Sign in</h2>
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
                  name="password"
                  onKeyUp={this.onKeyUp}
                />
              </FormGroup>

              <Button color="green" disabled={loading} onClick={this.handleLogin} block>
                Sign in{loading && '...'}
              </Button>

              <Link to="/auth/reset" className="reset">
                Forgot Password?
              </Link>
            </Form>
          </Board>

          <div className="signup">
            {'Not registered? '}
            <Link to="/auth/register">Sign up</Link>
          </div>
        </Container>
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    loading: state.auth.loading,
    errors: state.auth.errors
  }),
  { login }
)(Login);

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Button, Form, FormGroup, Label, Alert, Container } from 'reactstrap';

import { FormComponent, Board } from 'components';
import { resetPassword } from 'redux/reset';
import Wrapper from './Wrapper';

class Reset extends FormComponent {
  componentDidMount() {
    this.inputs.email.focus();
  }

  handleReset = () => {
    if (this.isValid(['email'])) {
      this.props.resetPassword(this.state.model);
    }
  };

  gotoSignin = () => {
    this.props.history.push('/auth');
  };

  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.handleReset();
    }
  };

  render() {
    const { loading, success } = this.props;
    const error = this.getError();

    return (
      <Wrapper>
        <Helmet title="Reset Password" />

        <Container>
          <Board className="board">
            <h2>Reset Password</h2>
            <hr />

            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}

            <Form>
              {!success && (
                <FormGroup>
                  <Label>Email Address</Label>
                  <this.FormInput
                    type="email"
                    // placeholder="Email Address"
                    name="email"
                    onKeyUp={this.onKeyUp}
                  />
                </FormGroup>
              )}

              <Button
                color={success ? 'yellow' : 'green'}
                disabled={loading}
                onClick={success ? this.gotoSignin : this.handleReset}
                block
              >
                {success ? 'Return to sign in' : 'Send reset email'}
                {loading && '...'}
              </Button>
              <input style={{ display: 'none' }} />
            </Form>
          </Board>
        </Container>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    loading: state.reset.loading,
    success: state.reset.success,
    errors: state.reset.errors
  }),
  { resetPassword }
)(Reset);

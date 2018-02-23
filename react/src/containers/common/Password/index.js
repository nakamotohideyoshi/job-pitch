import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Button, Form, FormGroup, Label, Alert } from 'reactstrap';

import { FormComponent, Board } from 'components';
import { changePassword } from 'redux/password';
import Container from './Wrapper';

class Password extends FormComponent {
  handleChangePassword = () => {
    if (this.isValid(['new_password1', 'new_password2'])) {
      this.props.changePassword(this.state.model);
    }
  };

  render() {
    const { loading, success } = this.props;
    const error = this.getError();

    return (
      <Fragment>
        <Helmet title="Change Password" />

        <Container>
          <Board className="board">
            <h2>Change Password</h2>
            <hr />

            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}

            <Form>
              <FormGroup>
                <Label>New Password</Label>
                <this.FormInput type="password" name="new_password1" />
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <this.FormInput type="password" name="new_password2" />
              </FormGroup>

              <Button color="green" disabled={loading} onClick={this.handleChangePassword} block>
                Change{loading && '...'}
              </Button>
            </Form>
          </Board>
        </Container>
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    loading: state.password.loading,
    success: state.password.success,
    errors: state.password.errors
  }),
  { changePassword }
)(Password);

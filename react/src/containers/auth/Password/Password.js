import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import { changePasswordAction } from 'redux/modules/api';
import * as utils from 'helpers/utils';

@connect(
  state => ({
    loading: state.api.loading,
  }),
  { changePasswordAction }
)
export default class Password extends FormComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    changePasswordAction: PropTypes.func.isRequired,
  }

  onChangePassword = () => {
    if (this.isValid(['new_password1', 'new_password2'])) {
      this.props.changePasswordAction(this.state.formModel)
        .then(() => utils.successNotif('Changed password!'))
        .catch(errors => this.setState({ errors }));
    }
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.onChangePassword();
    }
  }

  render() {
    return (
      <div className="home-container">
        <Helmet title="Change Password" />

        <div className="board padding-45">
          <h3>Change Password</h3>
          <Form>
            <FormGroup>
              <ControlLabel>New Password</ControlLabel>
              <this.TextField
                type="password"
                name="new_password1"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Confirm Password</ControlLabel>
              <this.TextField
                type="password"
                name="new_password2"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.props.loading}
                labels={['Change', 'Changing...']}
                onClick={this.onChangePassword}
              />
            </FormGroup>
          </Form>
        </div>
      </div>
    );
  }
}

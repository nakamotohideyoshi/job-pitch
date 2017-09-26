import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import { resetAction } from 'redux/modules/api';
import * as utils from 'helpers/utils';

@connect(
  state => ({
    loading: state.api.loading,
  }),
  { resetAction })
export default class Reset extends FormComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    resetAction: PropTypes.func.isRequired,
  }

  onReset = () => {
    if (this.isValid(['email'])) {
      this.props.resetAction(this.state.formModel)
        .then(() => utils.successNotif('Success!'));
    }
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.onReset();
    }
  }

  render() {
    return (
      <div className="home-container">
        <Helmet title="Reset Password" />

        <div className="board padding-45">
          <h3>Reset Password</h3>
          <Form>
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <this.TextField
                type="text"
                name="email"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.props.loading}
                labels={['Reset', 'Resetting...']}
                onClick={this.onReset}
              />
            </FormGroup>
          </Form>
        </div>
      </div>

    );
  }
}

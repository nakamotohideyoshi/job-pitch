import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { FormComponent } from 'components';
import * as authActions from 'redux/modules/auth';
import * as utils from 'helpers/utils';

@connect(
  state => ({
    loading: state.auth.loading,
  }),
  { ...authActions })
export default class Reset extends FormComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
  }

  onReset = () => {
    if (!this.isValid(['email'])) return;

    const { formModel } = this.state;
    this.props.reset(formModel)
    .then(() => utils.successNotif('Success!'));
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.onReset();
    }
  }

  render() {
    return (
      <div className="form">
        <Helmet title="Reset Password" />
        <h1>Reset Password</h1>
        <div className="content">
          <Form>
            <FormGroup>
              <this.TextField
                type="text"
                placeholder="Email Address"
                name="email"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.props.loading}
                labels={['Reset', 'Resetting...']}
                onClick={this.onReset}
                style={{ width: '100%' }}
              />
            </FormGroup>
          </Form>
        </div>
      </div>
    );
  }
}

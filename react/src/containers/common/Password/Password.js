import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { FormComponent } from 'components';
import * as authActions from 'redux/modules/auth';
import * as utils from 'helpers/utils';
import styles from './Password.scss';

@connect(
  state => ({
    loading: state.auth.loading,
  }),
  { ...authActions })
export default class Password extends FormComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    changePassword: PropTypes.func.isRequired,
  }

  onChangePassword = () => {
    if (!this.isValid(['new_password1', 'new_password2'])) return;

    const { formModel } = this.state;
    this.props.changePassword(formModel)
    .then(() => {
      utils.successNotif('Changed password!');
    })
    .catch(errors => this.setState({ errors }));
  }

  render() {
    return (
      <div className={styles.container}>
        <Helmet title="Change Password" />
        <h1 className="title">Change Password</h1>
        <div className={styles.content}>
          <Form>
            <FormGroup>
              <this.TextField
                type="password"
                placeholder="New Password"
                name="new_password1"
              />
            </FormGroup>
            <FormGroup>
              <this.TextField
                type="password"
                placeholder="Confirm Password"
                name="new_password2"
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.props.loading}
                labels={['Change', 'Changing...']}
                onClick={this.onChangePassword}
                style={{ width: '100%' }}
              />
            </FormGroup>
          </Form>
        </div>
      </div>
    );
  }
}

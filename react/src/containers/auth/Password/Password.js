import React from 'react';
import Helmet from 'react-helmet';
import Scroll from 'react-scroll';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './Password.scss';

export default class Password extends FormComponent {

  onChangePassword = () => {
    if (this.isValid(['new_password1', 'new_password2'])) {
      this.setState({ loading: true });
      ApiClient.shared().changePassword(this.state.formModel)
        .then(() => {
          this.setState({ loading: false });
          utils.successNotif('Changed password!');
        })
        .catch(errors => this.setState({
          loading: false,
          errors
        }));
    }
  }

  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.onChangePassword();
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <Helmet title="Change Password" />

        <div className="board padding-45">
          <h3>Change Password</h3>

          <Form>
            <FormGroup>
              <Scroll.Element name="new_password1">
                <ControlLabel>New Password</ControlLabel>
              </Scroll.Element>
              <this.TextField
                type="password"
                name="new_password1"
              />
            </FormGroup>
            <FormGroup>
              <Scroll.Element name="new_password2">
                <ControlLabel>Confirm Password</ControlLabel>
              </Scroll.Element>
              <this.TextField
                type="password"
                name="new_password2"
                onKeyUp={this.onKeyUp}
              />
            </FormGroup>
            <FormGroup>
              <this.SubmitButton
                submtting={this.state.loading}
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

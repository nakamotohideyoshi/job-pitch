import React from 'react';
import Helmet from 'react-helmet';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './Reset.scss';

export default class Reset extends FormComponent {

  onReset = () => {
    if (this.isValid(['email'])) {
      this.setState({ loading: true });
      ApiClient.shared().reset(this.state.formModel)
        .then(() => {
          this.setState({ loading: false });
          utils.successNotif('Success!');
        })
        .catch(errors => this.setState({
          loading: false,
          errors
        }));
    }
  }

  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.onReset();
    }
  }

  render() {
    return (
      <div className={styles.root}>
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
                submtting={this.state.loading}
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

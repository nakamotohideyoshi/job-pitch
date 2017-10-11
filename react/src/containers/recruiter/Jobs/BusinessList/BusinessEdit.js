import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import { FormComponent } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import styles from './BusinessEdit.scss';

@connect(
  () => ({}),
  { ...commonActions })
export default class BusinessEdit extends FormComponent {
  static propTypes = {
    setPermission: PropTypes.func.isRequired,
    business: PropTypes.object,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    business: {},
  }

  constructor(props) {
    const { business } = props;
    const formModel = Object.assign({}, business);
    const logo = {
      default: utils.getBusinessLogo(),
      url: utils.getBusinessLogo(business),
      exist: business.images && business.images.length > 0,
    };
    super(props, { formModel, logo, needToSave: true });
    this.api = ApiClient.shared();
    this.loadImage(logo, 'logo');
  }

  onAddCredit = () => {
    utils.setShared('credits_business_id', this.props.business.id);
    browserHistory.push('/recruiter/credits');
  }

  onSave = () => {
    if (!this.isValid(['name'])) return;

    const { formModel, logo } = this.state;

    this.setState({ saving: true });

    this.api.saveUserBusiness(formModel).then(
      business => {
        if (logo.file) {
          return this.api.uploadBusinessLogo(
            {
              business: business.id,
              image: logo.file,
            },
            event => {
              console.log(event);
            }
          );
        }
        if (business.images.length > 0 && !logo.exist) {
          return this.api.deleteBusinessLogo(business.images[0].id);
        }
      }
    ).then(
      () => {
        if (this.api.user.businesses.length === 0) {
          this.props.setPermission(1);
        }
        this.props.parent.onRefresh();
        this.props.parent.onEdit();
        utils.successNotif('Saved!');
        FormComponent.needToSave = false;
      },
      () => this.setState({ saving: false })
    );
  }

  render() {
    const { business } = this.props;
    const creditsLabel = business.id ?
      `${business.tokens} Credit${business.tokens !== 1 ? 's' : ''}` :
      `${this.api.initialTokens.tokens} free credits`;

    return (
      <div className={styles.root}>

        <div className={styles.header}>
          <h4>{business.id ? 'Edit' : 'Add'} Business</h4>
          <Link onClick={() => this.props.parent.onEdit()}>{'<< Back'}</Link>
        </div>

        <Form>
          <div className={styles.container1}>
            <this.ImageField name="logo" />
            <div className={styles.content}>
              <FormGroup>
                <ControlLabel>Name</ControlLabel>
                <this.TextField type="text" name="name" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Credits</ControlLabel>
                <span>{creditsLabel}</span>
                {
                  business.id &&
                  <Button
                    bsStyle="warning"
                    onClick={this.onAddCredit}
                  >Add Credits</Button>
                }
              </FormGroup>
            </div>
          </div>
        </Form>

        <div className={styles.footer}>
          <this.SubmitButtonWithCancel
            submtting={this.state.saving}
            labels={['Save', 'Saving...']}
            onClick={this.onSave}
            cancelLabel="Cancel"
            onCancel={() => this.props.parent.onEdit()}
          />
        </div>

      </div>
    );
  }
}

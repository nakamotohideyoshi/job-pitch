import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import { FormComponent } from 'components';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './BusinessEdit.scss';

@connect(
  (state) => ({
    saving: state.api.loading
  }),
  { ...apiActions }
)
export default class BusinessEdit extends FormComponent {
  static propTypes = {
    saving: PropTypes.bool.isRequired,
    saveUserBusinessAction: PropTypes.func.isRequired,
    uploadBusinessLogoAction: PropTypes.func.isRequired,
    deleteBusinessLogoAction: PropTypes.func.isRequired,
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
    super(props, { formModel, logo });
    this.loadImage(logo, 'logo');
  }

  onBack = () => {
    this.props.parent.onEdit();
  }

  onAddCredit = () => {
    browserHistory.push(`/recruiter/credits/${this.props.business.id}`);
  }

  onSave = () => {
    if (!this.isValid(['name'])) return;

    const { saveUserBusinessAction, uploadBusinessLogoAction, deleteBusinessLogoAction } = this.props;
    const { formModel, logo } = this.state;

    saveUserBusinessAction(formModel).then(business => {
      if (logo.file) {
        return uploadBusinessLogoAction(
          {
            business: business.id,
            image: logo.file,
          },
          event => {
            console.log(event);
          }
        ).then(() => this.saveSuccess);
      }
      if (business.images.length > 0 && !logo.exist) {
        return deleteBusinessLogoAction(business.images[0].id)
          .then(() => this.saveSuccess);
      }
      this.saveSuccess();
    });
  }

  saveSuccess = () => {
    this.onBack();
    this.props.parent.onRefresh();
    utils.successNotif('Saved!');
  }

  render() {
    const { saving, business } = this.props;
    const creditsLabel = business.id ?
      `${business.tokens} Credit${business.tokens !== 1 ? 's' : ''}` :
      `${ApiClient.initialTokens.tokens} free credits`;

    return (
      <div className={styles.root}>

        <div className={styles.header}>
          <h4>{business.id ? 'Edit' : 'Add'} Business</h4>
          <Link className="link" onClick={this.onBack}>{'<< Business List'}</Link>
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
          <this.SubmitButton
            submtting={saving}
            labels={['Save', 'Saving...']}
            onClick={this.onSave}
          />
        </div>

      </div>
    );
  }
}

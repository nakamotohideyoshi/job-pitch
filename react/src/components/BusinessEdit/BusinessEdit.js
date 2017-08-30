import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import { FormComponent } from 'components';
import * as jobmanagerActions from 'redux/modules/jobmanager';
import * as authActions from 'redux/modules/auth';
import * as utils from 'helpers/utils';

@connect(
  state => ({
    staticData: state.auth.staticData,
    saving: state.jobmanager.saving,
  }),
  { ...jobmanagerActions, ...authActions })
export default class BusinessEdit extends FormComponent {
  static propTypes = {
    staticData: PropTypes.object.isRequired,
    saving: PropTypes.bool.isRequired,
    saveUserBusiness: PropTypes.func.isRequired,
    uploadBusinessLogo: PropTypes.func.isRequired,
    deleteBusinessLogo: PropTypes.func.isRequired,
    selectBusiness: PropTypes.func.isRequired,
    setPermission: PropTypes.func.isRequired,
    business: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  componentDidMount() {
    Promise.resolve(this.props.business).then(business => {
      const formModel = Object.assign({}, business);
      const logo = {
        default: utils.getBusinessLogo(),
        url: utils.getBusinessLogo(business),
        exist: business.images && business.images.length > 0,
      };
      this.setState({ formModel, logo });
    });
  }

  onAddCredit = () => {
    this.props.selectBusiness(this.props.business);
    browserHistory.push('/recruiter/credits');
  }

  onClose = () => this.props.onClose();

  onSave = () => {
    if (!this.isValid(['name'])) return;

    const { saveUserBusiness, uploadBusinessLogo, deleteBusinessLogo, onClose } = this.props;
    const { formModel, logo } = this.state;

    saveUserBusiness(formModel).then(business => {
      this.props.setPermission(1);
      if (logo.file) {
        return uploadBusinessLogo(
          {
            business: business.id,
            image: logo.file,
          },
          event => {
            console.log(event);
          }
        ).then(() => {
          utils.successNotif('Saved!');
          onClose(business);
        });
      }
      if (business.images.length > 0 && !logo.exist) {
        return deleteBusinessLogo(business.images[0].id)
          .then(() => {
            utils.successNotif('Saved!');
            onClose(business);
          });
      }
      utils.successNotif('Saved!');
      onClose(business);
    });
  }

  render() {
    const { staticData, business, saving } = this.props;
    const creditsLabel = business.id ?
      `${business.tokens} Credit${business.tokens !== 1 ? 's' : ''}` :
      `${staticData.initialTokens.tokens} free credits`;
    return (
      <Modal show onHide={this.onClose} backdrop="static">
        <Form horizontal>
          <Modal.Header closeButton={saving === false}>
            <Modal.Title>{business.id ? 'Edit' : 'Add'} Business</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <this.TextFieldGroup
              type="text"
              label="Name"
              name="name"
            />
            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>Credits</Col>
              <Col sm={10}>
                <span style={{ paddingTop: '8px', display: 'inline-block' }}>{creditsLabel}</span>
                {
                  business.id &&
                  <Button
                    bsStyle="warning"
                    style={{ marginLeft: '10px' }}
                    onClick={this.onAddCredit}
                  >Add Credits</Button>
                }
              </Col>
            </FormGroup>
            <this.ImageFieldGroup
              label="Logo"
              name="logo"
            />
          </Modal.Body>

          <Modal.Footer>
            <this.SubmitCancelButtons
              submtting={saving}
              labels={['Save', 'Saving...']}
              onClick={this.onSave}
              cancelLabel="Cancel"
              onCancel={this.onClose}
            />
          </Modal.Footer>

        </Form>
      </Modal>
    );
  }
}

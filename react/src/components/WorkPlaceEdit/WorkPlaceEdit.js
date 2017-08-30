import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import { FormComponent, Map } from 'components';
import * as jobmanagerActions from 'redux/modules/jobmanager';
import * as utils from 'helpers/utils';

@connect(
  state => ({
    saving: state.jobmanager.saving,
    selectedBusiness: state.jobmanager.selectedBusiness,
  }),
  { ...jobmanagerActions })
export default class WorkPlaceForm extends FormComponent {
  static propTypes = {
    saving: PropTypes.bool.isRequired,
    selectedBusiness: PropTypes.object.isRequired,
    saveUserWorkPlace: PropTypes.func.isRequired,
    uploadWorkPlaceLogo: PropTypes.func.isRequired,
    deleteWorkPlaceLogo: PropTypes.func.isRequired,
    workplace: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  componentDidMount() {
    Promise.resolve(this.props.workplace).then(workplace => {
      const formModel = Object.assign({}, workplace);
      if (!formModel.id) {
        formModel.email = localStorage.getItem('email');
        formModel.email_public = true;
        formModel.mobile_public = true;
      }
      const logo = {
        default: utils.getBusinessLogo(workplace.business_data),
        url: utils.getWorkPlaceLogo(workplace),
        exist: workplace.images && workplace.images.length > 0,
      };
      const markerPos = workplace.latitude && { lat: workplace.latitude, lng: workplace.longitude };
      this.setState({ formModel, logo, markerPos });
    });
  }

  onClickMap = (pos, address) => {
    const { formModel, errors } = this.state;
    formModel.place_name = address;
    errors.place_name = null;
    this.setState({
      formModel,
      errors,
      markerPos: pos,
    });
  }

  onClose = () => this.props.onClose();

  onSave = () => {
    if (!this.isValid(['name', 'place_name', 'description', 'email'])) return;

    const { selectedBusiness, saveUserWorkPlace, uploadWorkPlaceLogo, deleteWorkPlaceLogo, onClose } = this.props;
    const { formModel, logo, markerPos } = this.state;
    const data = Object.assign(this.props.workplace, formModel);
    data.business = selectedBusiness.id;
    data.telephone = '';
    data.telephone_public = false;
    data.address = '';
    data.postcode_lookup = '';
    data.place_id = '';
    data.latitude = markerPos.lat;
    data.longitude = markerPos.lng;

    saveUserWorkPlace(data).then(workplace => {
      if (logo.file) {
        return uploadWorkPlaceLogo(
          {
            location: workplace.id,
            image: logo.file,
          },
          event => {
            console.log(event);
          }
        ).then(() => {
          utils.successNotif('Saved!');
          onClose(workplace);
        });
      }
      if (workplace.images.length > 0 && !logo.exist) {
        return deleteWorkPlaceLogo(workplace.images[0].id)
          .then(() => {
            utils.successNotif('Saved!');
            onClose(workplace);
          });
      }
      utils.successNotif('Saved!');
      onClose(workplace);
    });
  }

  render() {
    const { workplace, saving } = this.props;
    const { markerPos } = this.state;
    return (
      <Modal show onHide={this.onClose} backdrop="static">
        <Form horizontal>
          <Modal.Header closeButton={saving === false}>
            <Modal.Title>{workplace.id ? 'Edit' : 'Add'} Workplace</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <this.TextFieldGroup
              type="text"
              label="Name"
              name="name"
            />
            <this.TextFieldGroup
              label="Description"
              componentClass="textarea"
              name="description"
            />
            <this.TextFieldCheckGroup
              type="email"
              label="Email"
              name="email"
              checkLabel="Public"
              checkName="email_public"
            />
            <this.TextFieldCheckGroup
              type="text"
              label="Mobile"
              name="mobile"
              checkLabel="Public"
              checkName="mobile_public"
            />
            <this.TextFieldGroup
              type="text"
              label="Address"
              name="place_name"
              disabled
            />
            <FormGroup>
              <Col smOffset={2} sm={10} style={{ height: '300px' }}>
                <Map
                  defaultCenter={markerPos}
                  marker={markerPos}
                  onClick={this.onClickMap}
                />
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

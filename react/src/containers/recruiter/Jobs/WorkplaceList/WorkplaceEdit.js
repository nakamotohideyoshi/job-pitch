import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent, Map } from 'components';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import styles from './WorkplaceEdit.scss';

@connect(
  (state) => ({
    saving: state.api.loading
  }),
  { ...apiActions }
)
export default class WorkplaceEdit extends FormComponent {
  static propTypes = {
    saving: PropTypes.bool.isRequired,
    saveUserWorkplaceAction: PropTypes.func.isRequired,
    uploadWorkplaceLogoAction: PropTypes.func.isRequired,
    deleteWorkplaceLogoAction: PropTypes.func.isRequired,
    businessId: PropTypes.number.isRequired,
    workplace: PropTypes.object,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    workplace: {},
  }

  constructor(props) {
    const { workplace } = props;
    const formModel = Object.assign({}, workplace);
    if (!formModel.id) {
      formModel.email = localStorage.getItem('email');
      formModel.email_public = true;
      formModel.mobile_public = true;
    }
    const logo = {
      default: utils.getBusinessLogo(workplace.business_data),
      url: utils.getWorkplaceLogo(workplace),
      exist: workplace.images && workplace.images.length > 0,
    };
    const markerPos = workplace.latitude && { lat: workplace.latitude, lng: workplace.longitude };
    super(props, { formModel, logo, markerPos });
    this.loadImage(logo, 'logo');
  }

  onBack = () => {
    this.props.parent.onEdit();
  }

  onSave = () => {
    if (!this.isValid(['name', 'place_name', 'description', 'email'])) return;

    const { busineesId, saveUserWorkplaceAction, uploadWorkplaceLogoAction, deleteWorkplaceLogoAction } = this.props;
    const { formModel, logo, markerPos } = this.state;
    const data = Object.assign(this.props.workplace, formModel);
    data.business = busineesId;
    data.telephone = '';
    data.telephone_public = false;
    data.address = '';
    data.postcode_lookup = '';
    data.place_id = '';
    data.latitude = markerPos.lat;
    data.longitude = markerPos.lng;

    saveUserWorkplaceAction(data).then(workplace => {
      if (logo.file) {
        return uploadWorkplaceLogoAction(
          {
            location: workplace.id,
            image: logo.file,
          },
          event => {
            console.log(event);
          }
        ).then(() => this.saveSuccess);
      }
      if (workplace.images.length > 0 && !logo.exist) {
        return deleteWorkplaceLogoAction(workplace.images[0].id)
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
    const { saving, workplace } = this.props;
    const { markerPos } = this.state;

    return (
      <div className={styles.root}>

        <div className={styles.header}>
          <h4>{workplace.id ? 'Edit' : 'Add'} Workplace</h4>
          <Link className="link" onClick={this.onBack}>{'<< Workplace List'}</Link>
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
                <ControlLabel>Email</ControlLabel>
                <this.TextField type="text" name="email" />
                <this.CheckBoxField label="Public" name="email_public" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Mobile</ControlLabel>
                <this.TextField type="text" name="mobile" />
                <this.CheckBoxField label="Public" name="mobile_public" />
              </FormGroup>
            </div>
          </div>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <this.TextField
              componentClass="textarea"
              name="description"
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Location</ControlLabel>
            <this.TextField
              type="text"
              name="place_name"
              disabled
            />
            <div style={{ height: '300px' }}>
              <Map
                defaultCenter={markerPos}
                marker={markerPos}
                onClick={this.onClickMap}
              />
            </div>
            
          </FormGroup>
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

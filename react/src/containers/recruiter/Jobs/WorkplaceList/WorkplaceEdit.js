import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent, Map, HelpIcon } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './WorkplaceEdit.scss';

export default class WorkplaceEdit extends FormComponent {
  static propTypes = {
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
      formModel.email = utils.getCookie('email');
      formModel.email_public = true;
      formModel.mobile_public = true;
    }
    const logo = {
      default: utils.getBusinessLogo(workplace.business_data),
      url: utils.getWorkplaceLogo(workplace),
      exist: workplace.images && workplace.images.length > 0,
    };
    const markerPos = workplace.latitude && { lat: workplace.latitude, lng: workplace.longitude };
    super(props, { formModel, logo, markerPos, needToSave: true });
    this.api = ApiClient.shared();
    this.loadImage(logo, 'logo');
  }

  onSelectedLocation = (pos, address) => {
    const { formModel, errors } = this.state;
    formModel.place_name = address;
    errors.place_name = null;
    this.setState({
      formModel,
      errors,
      markerPos: pos,
    });
    FormComponent.needToSave = true;
  }

  onSave = () => {
    if (!this.isValid(['name', 'place_name', 'description', 'email'])) return;

    const { formModel, logo, markerPos } = this.state;
    const data = Object.assign(this.props.workplace, formModel);
    data.telephone = '';
    data.telephone_public = false;
    data.address = '';
    data.postcode_lookup = '';
    data.place_id = '';
    data.latitude = markerPos.lat;
    data.longitude = markerPos.lng;

    this.setState({ saving: true });

    this.api.saveUserWorkplace(data).then(
      workplace => {
        if (logo.file) {
          return this.api.uploadWorkplaceLogo(
            {
              location: workplace.id,
              image: logo.file,
            },
            event => {
              console.log(event);
            }
          );
        }
        if (workplace.images.length > 0 && !logo.exist) {
          return this.api.deleteWorkplaceLogo(workplace.images[0].id);
        }
      }
    ).then(
      () => {
        this.props.parent.onRefresh();
        this.props.parent.onEdit();
        utils.successNotif('Saved!');
        FormComponent.needToSave = false;
      },
      () => this.setState({ saving: false })
    );
  }

  render() {
    const { workplace } = this.props;
    const { markerPos } = this.state;

    return (
      <div className={styles.root}>

        <div className={styles.header}>
          <h4>{workplace.id ? 'Edit' : 'Add'} Workplace</h4>
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
                <ControlLabel>Email</ControlLabel>
                <this.TextField type="text" name="email" />
                <HelpIcon
                  label={`This is the email that notifications will be sent to,
                  it can be different to your login email address.`}
                />
                <div className={styles.public1}>
                  Public <this.CheckBoxField name="email_public" />
                </div>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Mobile</ControlLabel>
                <this.TextField type="text" name="mobile" />
                <div className={styles.public2}>
                  Public <this.CheckBoxField name="mobile_public" />
                </div>
              </FormGroup>
            </div>
          </div>

          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <this.TextAreaField
              name="description"
              maxLength="10000"
              minRows={3}
              maxRows={20}
            />
          </FormGroup>

          <FormGroup>
            <div className={styles.withHelp}>
              <ControlLabel>Location</ControlLabel>
              <HelpIcon
                label="Search for a place name, street, postcode, etc. or click the map to select location."
              />
            </div>
            <this.TextField
              type="text"
              name="place_name"
              className={styles.placeName}
              placeholder="Select location in the map"
              disabled
            />
            <div style={{ height: '300px' }}>
              <Map
                defaultCenter={markerPos}
                marker={markerPos}
                onSelected={this.onSelectedLocation}
              />
            </div>
          </FormGroup>
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

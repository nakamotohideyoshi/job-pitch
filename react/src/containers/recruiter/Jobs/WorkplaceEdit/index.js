import React from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, BreadcrumbItem, Button, Form, FormGroup, Label, Alert } from 'reactstrap';

import {
  FormComponent,
  SaveFormComponent,
  Board,
  Loading,
  GoogleMap,
  HelpIcon,
  Required,
  PopupProgress
} from 'components';
import { confirm } from 'redux/common';
import { getWorkplace, saveWorkplace } from 'redux/recruiter/workplaces';
import * as helper from 'utils/helper';
import Wrapper, { WithPublic } from './Wrapper';

class WorkplaceEdit extends SaveFormComponent {
  componentWillMount() {
    const workplaceId = parseInt(this.props.match.params.workplaceId, 10);
    this.props.getWorkplace(workplaceId);
  }

  componentWillReceiveProps(nextProps) {
    const { workplace } = nextProps;
    if (workplace && workplace !== this.props.workplace) {
      const model = Object.assign(this.state.model, workplace);
      model.business = model.business || this.props.match.params.businessId;
      this.setState({
        model,
        logo: {
          default: helper.getBusinessLogo(workplace.business_data),
          url: helper.getWorkplaceLogo(workplace),
          exist: (workplace.images || []).length > 0
        }
      });
    }
  }

  onSelectedLocation = (place_id, place_name, latitude, longitude) => {
    const { model, errors } = this.state;
    model.place_id = place_id;
    model.place_name = place_name;
    model.latitude = latitude;
    model.longitude = longitude;
    delete errors.place_name;
    this.setState({ model });
    FormComponent.modified = true;
  };

  onSave = () => {
    if (!this.isValid(['name', 'email', 'description', 'place_name'])) return;

    const data = Object.assign({}, this.state.model);
    this.props.saveWorkplace(data, this.state.logo, (label, value) => {
      const progress = label ? { label, value } : null;
      this.setState({ progress });
    });
  };

  onCancel = () => {
    const { businessId } = this.props.match.params;
    helper.routePush(`/recruiter/jobs/${businessId}`, this.props);
  };

  onRoutePush = to => {
    helper.routePush(to, this.props);
  };

  render() {
    const { workplace, errors } = this.props;
    const { latitude, longitude } = this.state.model;
    const marker = latitude && { lat: latitude, lng: longitude };
    const error = this.getError();
    const { progress } = this.state;

    return (
      <Wrapper>
        <Breadcrumb>
          <BreadcrumbItem tag="a" onClick={() => this.onRoutePush(`/recruiter/jobs`)}>
            Businesses
          </BreadcrumbItem>
          <BreadcrumbItem
            tag="a"
            onClick={() => {
              const { businessId } = this.props.match.params;
              this.onRoutePush(`/recruiter/jobs/${businessId}`);
            }}
          >
            Workplaces
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            {(workplace || {}).id ? 'Edit' : 'Add'}
          </BreadcrumbItem>
        </Breadcrumb>

        {workplace ? (
          <Board block>
            <Form>
              <div className="logo-container">
                <FormGroup>
                  <this.FormLogoSelect />
                </FormGroup>
              </div>

              <div className="right-container">
                <FormGroup>
                  <Label>
                    Name<Required />
                  </Label>
                  <this.FormInput name="name" />
                </FormGroup>

                <FormGroup>
                  <WithPublic>
                    <Label>
                      Email<Required />
                      <HelpIcon
                        style={{ left: '65px' }}
                        position="top-start"
                        label={`This is the email that notifications will be sent to, it can be different to your login email address.`}
                      />
                    </Label>
                    <this.FormCheckbox name="email_public" label="Public" />
                  </WithPublic>
                  <this.FormInput name="email" type="email" className="with-public" />
                </FormGroup>

                <FormGroup>
                  <WithPublic>
                    <Label>Phone</Label>
                    <this.FormCheckbox name="mobile_public" label="Public" />
                  </WithPublic>
                  <this.FormInput name="mobile" className="with-public" />
                </FormGroup>
              </div>

              <FormGroup>
                <Label>
                  Describe your workplace<Required />
                </Label>
                <this.FormTextArea name="description" maxLength="10000" minRows={3} maxRows={20} />
              </FormGroup>

              <FormGroup>
                <Label>
                  Location<Required />
                  <HelpIcon
                    style={{ left: '87px' }}
                    position="top-start"
                    label={`Search for a place name, street, postcode, etc. or click the map to select location.`}
                  />
                </Label>
                <this.FormInput name="place_name" disabled />
                <div className="map">
                  <div>
                    <GoogleMap defaultCenter={marker} markers={[marker]} onSelectedLocation={this.onSelectedLocation} />
                  </div>
                </div>
              </FormGroup>

              {error && <Alert color="danger">{error}</Alert>}

              <div>
                <Button color="green" size="lg" disabled={workplace.saving} onClick={this.onSave}>
                  {workplace.saving ? 'Saving...' : 'Save'}
                </Button>
                <Button color="gray" size="lg" outline onClick={this.onCancel}>
                  Cancel
                </Button>
              </div>
            </Form>

            {progress && <PopupProgress label={progress.label} value={progress.value} />}
          </Board>
        ) : !errors ? (
          <Loading />
        ) : (
          <Alert type="danger">Error!</Alert>
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    workplace: state.rc_workplaces.selectedWorkplace,
    errors: state.rc_workplaces.errors
  }),
  { confirm, getWorkplace, saveWorkplace }
)(WorkplaceEdit);

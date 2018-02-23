import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Form, FormGroup, Label, Button, Row, Col, Alert } from 'reactstrap';

import { FormComponent, SaveFormComponent, Board, HelpIcon, Required, Loading, GoogleMap } from 'components';
import { loadJobProfile, saveJobProfile } from 'redux/jobseeker/jobprofile';
import { SDATA } from 'utils/data';
import Container from './Wrapper';

class JobProfile extends SaveFormComponent {
  componentWillMount() {
    this.hours = [{ id: -1, name: 'Any' }].concat(SDATA.hours);
    this.contracts = [{ id: -1, name: 'Any' }].concat(SDATA.contracts);
    this.props.loadJobProfile();
  }

  componentWillReceiveProps(nextProps) {
    const { profile } = nextProps;
    if (profile && profile !== this.props.profile) {
      const model = Object.assign(this.state.model, profile);
      this.setState({ model });
    }
  }

  onSelectedLocation = (place_id, place_name, latitude, longitude) => {
    const { model, errors } = this.state;
    model.place_id = place_id;
    model.place_name = place_name;
    model.latitude = latitude;
    model.longitude = longitude;
    errors.place_name = null;
    this.setState({ model, errors });
    FormComponent.modified = true;
  };

  onSave = () => {
    if (this.isValid(['sectors', 'place_name'])) {
      const data = Object.assign({}, this.state.model);
      this.props.saveJobProfile(data);
    }
  };

  render() {
    if (!this.props.profile) {
      return (
        <Container>
          <Loading />
        </Container>
      );
    }

    const { saving } = this.props;
    const { latitude, longitude } = this.state.model;
    const marker = latitude && { lat: latitude, lng: longitude };
    const error = this.getError();

    return (
      <Fragment>
        <Helmet title="Job Profile" />

        <Container>
          <h2>Job Profile</h2>

          <Board block>
            <Form>
              <FormGroup>
                <Label>
                  Sectors<Required />
                </Label>
                <this.FormSelect name="sectors" options={SDATA.sectors} multi />
              </FormGroup>

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>Contract</Label>
                    <this.FormSelect name="contract" options={this.contracts} clearable={false} searchable={false} />
                  </FormGroup>
                </Col>

                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>Hours</Label>
                    <this.FormSelect name="hours" options={this.hours} clearable={false} searchable={false} />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label>
                  Match area<Required />
                  <HelpIcon
                    style={{ left: '103px' }}
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

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>Radius</Label>
                    <this.FormSelect
                      name="search_radius"
                      options={SDATA.searchRadius}
                      clearable={false}
                      searchable={false}
                    />
                  </FormGroup>
                </Col>
              </Row>

              {error && <Alert color="danger">{error}</Alert>}

              <Button color="green" size="lg" disabled={saving} onClick={this.onSave}>
                {!saving ? 'Save' : 'Saving...'}
              </Button>
            </Form>
          </Board>
        </Container>
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    profile: state.js_jobprofile.profile,
    errors: state.js_jobprofile.errors,
    saving: state.js_jobprofile.saving
  }),
  { loadJobProfile, saveJobProfile }
)(JobProfile);

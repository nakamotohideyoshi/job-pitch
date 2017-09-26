import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import { Loading, FormComponent, Map } from 'components';
import * as commonActions from 'redux/modules/common';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './JobProfile.scss';

const SEARCH_RADIUS = [
  { id: 1, name: '1 mile' },
  { id: 2, name: '2 miles' },
  { id: 5, name: '5 miles' },
  { id: 10, name: '10 miles' },
  { id: 50, name: '50 miles' },
];

@connect(
  () => ({
  }),
  { ...commonActions, ...apiActions })
export default class JobProfile extends FormComponent {
  static propTypes = {
    getJobProfileAction: PropTypes.func.isRequired,
    saveJobProfileAction: PropTypes.func.isRequired,
    setPermission: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.contracts = [{ id: -1, name: 'Any' }].concat(ApiClient.contracts);
    this.hours = [{ id: -1, name: 'Any' }].concat(ApiClient.hours);
    this.getJobProfile().then(profile => {
      const formModel = Object.assign({}, profile);
      formModel.sectors = ApiClient.sectors.filter(item => profile.sectors.includes(item.id));
      formModel.contract = this.contracts.filter(item => item.id === (profile.contract || -1))[0];
      formModel.hours = this.hours.filter(item => item.id === (profile.hours || -1))[0];
      formModel.search_radius = SEARCH_RADIUS.filter(item => item.id === profile.search_radius)[0];
      const markerPos = profile.latitude && { lat: profile.latitude, lng: profile.longitude };
      this.setState({ profile, formModel, markerPos });
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

  getJobProfile = () => {
    const { getJobProfileAction } = this.props;
    if (ApiClient.jobSeeker.profile) {
      return getJobProfileAction(ApiClient.jobSeeker.profile);
    }
    return Promise.resolve({
      job_seeker: ApiClient.jobSeeker.id,
      sectors: [],
      contract: this.contracts[0].id,
      hours: this.hours[0].id,
      search_radius: SEARCH_RADIUS[2].id,
    });
  }

  onSave = () => {
    if (!this.isValid(['sectors', 'place_name'])) return;

    const { saveJobProfileAction, setPermission } = this.props;
    const { formModel, markerPos } = this.state;
    const data = Object.assign(this.state.profile, formModel);
    data.sectors = formModel.sectors.map(item => item.id);
    data.contract = formModel.contract.id !== -1 ? formModel.contract.id : null;
    data.hours = formModel.hours.id !== -1 ? formModel.hours.id : null;
    data.search_radius = formModel.search_radius.id;
    data.latitude = markerPos.lat;
    data.longitude = markerPos.lng;

    this.setState({ saving: true });
    saveJobProfileAction(data).then(profile => {
      this.setState({ profile, saving: false });
      setPermission(2);
      utils.successNotif('Success!');
    })
    .catch(errors => this.setState({ errors }));
  }

  render() {
    const { profile, markerPos, saving } = this.state;

    if (!profile) {
      return <Loading />;
    }

    return (
      <div className={styles.root}>
        <Helmet title="Job Profile" />

        <div className="container">
          <div className="pageHeader">
            <h3>Job Profile</h3>
          </div>

          <div className="shadow-board padding-45">
            <Form>
              <FormGroup>
                <ControlLabel>Sectors</ControlLabel>
                <this.SelectField
                  name="sectors"
                  dataSource={ApiClient.sectors}
                  placeholder="Select Sectors"
                  multiple
                  searchable
                  searchPlaceholder="Search"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Contract</ControlLabel>
                <this.SelectField
                  name="contract"
                  dataSource={this.contracts}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Hours</ControlLabel>
                <this.SelectField
                  name="hours"
                  dataSource={this.hours}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Match area</ControlLabel>
                <HelpBlock>
                  In order to match you with jobs in your area, you must tell us your location, 
                  and specify the maximum distance to search.
                </HelpBlock>
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
              <FormGroup>
                <ControlLabel>Radius</ControlLabel>
                <this.SelectField
                  name="search_radius"
                  dataSource={SEARCH_RADIUS}
                />
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
        </div>
      </div>
    );
  }
}

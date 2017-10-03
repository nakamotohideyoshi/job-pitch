import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { Loading, HelpIcon, FormComponent, Map } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import styles from './JobProfile.scss';

const SEARCH_RADIUS = [
  { id: 1, name: '1 mile' },
  { id: 2, name: '2 miles' },
  { id: 5, name: '5 miles' },
  { id: 10, name: '10 miles' },
  { id: 50, name: '50 miles' },
];

@connect(
  () => ({ }),
  { ...commonActions })
export default class JobProfile extends FormComponent {
  static propTypes = {
    setPermission: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.contracts = [{ id: -1, name: 'Any' }].concat(this.api.contracts);
    this.hours = [{ id: -1, name: 'Any' }].concat(this.api.hours);
    this.getJobProfile().then(profile => {
      const formModel = Object.assign({}, profile);
      formModel.sectors = this.api.sectors.filter(item => profile.sectors.includes(item.id));
      formModel.contract = this.contracts.filter(item => item.id === (profile.contract || -1))[0];
      formModel.hours = this.hours.filter(item => item.id === (profile.hours || -1))[0];
      formModel.search_radius = SEARCH_RADIUS.filter(item => item.id === profile.search_radius)[0];
      const markerPos = profile.latitude && { lat: profile.latitude, lng: profile.longitude };
      this.setState({ profile, formModel, markerPos });
    });
  }

  getJobProfile = () => {
    if (this.api.jobSeeker.profile) {
      return this.api.getJobProfile(this.api.jobSeeker.profile);
    }
    return Promise.resolve({
      job_seeker: this.api.jobSeeker.id,
      sectors: [],
      contract: this.contracts[0].id,
      hours: this.hours[0].id,
      search_radius: SEARCH_RADIUS[2].id,
    });
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
  }

  onSave = () => {
    if (!this.isValid(['sectors', 'place_name'])) return;

    const { formModel, markerPos } = this.state;
    const data = Object.assign(this.state.profile, formModel);
    data.sectors = formModel.sectors.map(item => item.id);
    data.contract = formModel.contract.id !== -1 ? formModel.contract.id : null;
    data.hours = formModel.hours.id !== -1 ? formModel.hours.id : null;
    data.search_radius = formModel.search_radius.id;
    data.latitude = markerPos.lat;
    data.longitude = markerPos.lng;

    this.setState({ saving: true });

    this.api.saveJobProfile(data).then(profile => {
      utils.successNotif('Success!');
      this.props.setPermission(2);
      if (this.state.profile.id) {
        this.setState({ profile, saving: false });
      } else {
        browserHistory.push('/jobseeker/find');
      }
    })
    .catch(errors => this.setState({
      saving: false,
      errors
    }));
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

          <div className="board-shadow padding-45">
            <Form>
              <FormGroup>
                <ControlLabel>Sectors</ControlLabel>
                <this.SelectField
                  name="sectors"
                  dataSource={this.api.sectors}
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
                <div className={styles.withHelp}>
                  <ControlLabel>Match area</ControlLabel>
                  <HelpIcon
                    label={`In order to match you with jobs in your area, you must tell us your location,
                      and specify the maximum distance to search.`}
                  />
                </div>
                <this.TextField
                  type="text"
                  name="place_name"
                  className={styles.placeName}
                  placeholder="Select your location in the map"
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
